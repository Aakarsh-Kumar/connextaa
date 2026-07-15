import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { JoinStatus, CollaborationStatus, NotificationType } from '@prisma/client';
import createNotification from '../utils/createNotification';

const updateCollaborationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as { id: string };
    const { title, description, scheduledAt, maxMembers } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        creatorId: true,
        maxMembers: true,
        status: true,
        category: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!collaboration) {
      return res
        .status(404)
        .json({ success: false, message: 'Collaboration not found' });
    }

    if (collaboration.creatorId !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Only the creator can update the collaboration',
        });
    }

    if (
      collaboration.status === CollaborationStatus.COMPLETED ||
      collaboration.status === CollaborationStatus.CANCELLED
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Completed or cancelled collaborations cannot be edited',
        });
    }

    // Get current approved members count
    const approvedMembersCount = await prisma.collaborationMember.count({
      where: {
        collaborationId: id,
        joinStatus: JoinStatus.APPROVED,
      },
    });

    // Check if new maxMembers is less than approved members
    if (maxMembers !== undefined && maxMembers < approvedMembersCount) {
      return res.status(400).json({
        success: false,
        message: `Maximum members cannot be less than the current count of approved members (${approvedMembersCount})`,
      });
    }

    if (maxMembers !== undefined && maxMembers < 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum members must be at least 2.',
      });
    }

    // Perform database updates
    // Build data object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduledAt !== undefined)
      updateData.scheduledAt = new Date(scheduledAt);
    if (maxMembers !== undefined) updateData.maxMembers = maxMembers;

    const updated = await prisma.collaboration.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        members: {
          where: { joinStatus: JoinStatus.APPROVED },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Format members to match CollaborationResponse structure
    const formattedMembers = updated.members.map((m: any) => ({
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      avatarUrl: m.user.avatarUrl,
    }));

    return res.status(200).json({
      success: true,
      collaboration: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        fromLocation: {
          name: updated.fromLocationName,
          lat: updated.fromLat,
          lng: updated.fromLng,
        },
        toLocation: {
          name: updated.toLocationName,
          lat: updated.toLat,
          lng: updated.toLng,
        },
        scheduledAt: updated.scheduledAt.toISOString(),
        maxMembers: updated.maxMembers,
        status: updated.status,
        creator: updated.creator,
        category: updated.category,
      },
      members: formattedMembers,
      currentMembers: approvedMembersCount,
      isCreator: true,
      myJoinStatus: JoinStatus.APPROVED,
    });
  } catch (error) {
    logger.error('Error updating collaboration', { error });
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

const deleteCollaborationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as { id: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id },
      select: { creatorId: true, status: true, title: true },
    });

   // Get current approved members count
    const approvedMembers = await prisma.collaborationMember.findMany({
      where: {
        collaborationId: id,
        joinStatus: JoinStatus.APPROVED,
      },
    });

    if (!collaboration) {
      return res
        .status(404)
        .json({ success: false, message: 'Collaboration not found' });
    }

    if (collaboration.creatorId !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Only the creator can delete the collaboration',
        });
    }

    if (
      collaboration.status !== CollaborationStatus.OPEN &&
      collaboration.status !== CollaborationStatus.FULL
    ) {
      return res.status(400).json({
        success: false,
        message: 'Only active collaborations can be cancelled.',
      });
    }


    // Soft-delete: update status to CANCELLED and set deletedAt
    await prisma.$transaction(async(tx)=>{
      await tx.collaboration.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: CollaborationStatus.CANCELLED,
        },
      });
      await Promise.all(
        approvedMembers.map((member) =>
          createNotification(
            tx,
            member.userId,
            NotificationType.COLLABORATION_CANCELLED,
            "Collaboration Cancelled",
            `Collaboration "${collaboration.title}" has been cancelled.`,
            false,
            null
          )
        )
      );
    })
    

    // TODO:
    // When collaboration is cancelled (deleted):
    // - create notifications (COLLABORATION_CANCELLED) for all approved members

    return res.status(200).json({
      success: true,
      message: 'Collaboration deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting collaboration', { error });
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

const completeCollaborationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as { id: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        status: true,
        scheduledAt: true,
        title: true,
        category: true,
        maxMembers: true,
        fromLocationName: true,
        fromLat: true,
        fromLng: true,
        toLocationName: true,
        toLat: true,
        toLng: true,
        deletedAt: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        chatRoom: {
          select:{
            id: true,
          }
        }
      },
    });

    if (!collaboration) {
      return res
        .status(404)
        .json({ success: false, message: 'Collaboration not found' });
    }

    if (collaboration.creatorId !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Only the creator can complete the collaboration',
        });
    }

    // 1. Explicit Status Validation
    switch (collaboration.status) {
      case CollaborationStatus.COMPLETED:
        return res.status(400).json({
          success: false,
          message: "Collaboration is already completed",
        });

      case CollaborationStatus.CANCELLED:
        return res.status(400).json({
          success: false,
          message: "Cancelled collaborations cannot be completed",
        });

      case CollaborationStatus.OPEN:
      case CollaborationStatus.FULL:
        break;
    }
    
    if (collaboration.deletedAt) {
    return res.status(400).json({
        success:false,
        message:"Collaboration has been deleted."
    });
}
    // 2. Timing Validation
    const now = new Date();
    const canCompleteAt = new Date(collaboration.scheduledAt);
    canCompleteAt.setMinutes(canCompleteAt.getMinutes() - 30);

    if (now < canCompleteAt) {
      return res.status(400).json({
        success: false,
        message: 'This activity cannot be completed before it starts.',
      });
    }

    // 3. Participant Count Validation
    const approvedMembersCount = await prisma.collaborationMember.count({
      where: {
        collaborationId: id,
        joinStatus: JoinStatus.APPROVED,
      },
    });

    if (approvedMembersCount <= 1) {
      return res.status(400).json({
        success: false,
        message:
          'At least one participant must join before completing the activity.',
      });
    }

    // Update status to COMPLETED
    await prisma.$transaction(async(tx)=>{
      const updated = await tx.collaboration.update({
        where: { id },
        data: {
          status: CollaborationStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
              onboardingCompleted: true,
              username: true,
              avatarUrl: true,
              bio: true,
            },
          },
          members: {
            where: { joinStatus: JoinStatus.APPROVED },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // TODO:
      // Ratings are available for 7 days after completedAt.
      // Rating availability is computed dynamically.
      // No database state is required.

      // TODO:
      // Create COLLABORATION_COMPLETED notifications
      // for all approved members except the creator.

      // Chat cleanup is handled by the hourly cron.
      // Delete chat room, members and messages
      // after completedAt + 7 days.

      // Format members to match CollaborationResponse structure
      const formattedMembers = updated.members.map((m: any) => ({
        id: m.user.id,
        name: m.user.name,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
      }));

      await Promise.all(
        formattedMembers.map((member) =>
          createNotification(
            tx,
            member.id,
            NotificationType.COLLABORATION_COMPLETED,
            "Collaboration Completed",
            `Yo! Your collaboration "${collaboration.title}" has been completed.`,
            false,
            collaboration.chatRoom?.id || null
          )
        )
    );

      return res.status(200).json({
       success: true,
       collaboration: {
         id: updated.id,
         title: updated.title,
         description: updated.description,
         fromLocation: {
           name: updated.fromLocationName,
           lat: updated.fromLat,
           lng: updated.fromLng,
         },
         toLocation: {
           name: updated.toLocationName,
           lat: updated.toLat,
           lng: updated.toLng,
         },
         scheduledAt: updated.scheduledAt.toISOString(),
         maxMembers: updated.maxMembers,
         status: updated.status,
         creator: updated.creator,
         category: updated.category,
       },
       members: formattedMembers,
       currentMembers: approvedMembersCount,
       isCreator: true,
       myJoinStatus: JoinStatus.APPROVED,
      });
    })
    
  } catch (error) {
    logger.error('Error completing collaboration', { error });
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export {
  updateCollaborationController,
  deleteCollaborationController,
  completeCollaborationController,
};
