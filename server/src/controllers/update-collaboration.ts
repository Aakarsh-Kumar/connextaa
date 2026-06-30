import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { JoinStatus, CollaborationStatus } from '@prisma/client';

const updateCollaborationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as { id: string };
    const { title, description, scheduledAt, maxMembers, status, fromLocation, toLocation } = req.body;

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
          }
        }
      }
    });

    if (!collaboration) {
      return res.status(404).json({ success: false, message: 'Collaboration not found' });
    }

    if (collaboration.creatorId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the creator can update the collaboration' });
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

    // Perform database updates
    const updated = await prisma.$transaction(async (tx) => {
      // Build data object
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
      if (maxMembers !== undefined) updateData.maxMembers = maxMembers;
      if (status !== undefined) updateData.status = status as CollaborationStatus;

      if (fromLocation) {
        updateData.fromLocationName = fromLocation.name;
        if (fromLocation.lat !== undefined) updateData.fromLat = fromLocation.lat;
        if (fromLocation.lng !== undefined) updateData.fromLng = fromLocation.lng;
      }
      if (toLocation) {
        updateData.toLocationName = toLocation.name;
        if (toLocation.lat !== undefined) updateData.toLat = toLocation.lat;
        if (toLocation.lng !== undefined) updateData.toLng = toLocation.lng;
      }

      const collab = await tx.collaboration.update({
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
            }
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
                }
              }
            }
          }
        }
      });

      // Update PostGIS geography point columns if location changes
      if (fromLocation && fromLocation.lng !== undefined && fromLocation.lat !== undefined) {
        await tx.$executeRaw`
          UPDATE collaborations
          SET from_point = ST_SetSRID(ST_MakePoint(${fromLocation.lng}, ${fromLocation.lat}), 4326)::geography
          WHERE id = ${id}
        `;
      }
      if (toLocation && toLocation.lng !== undefined && toLocation.lat !== undefined) {
        await tx.$executeRaw`
          UPDATE collaborations
          SET to_point = ST_SetSRID(ST_MakePoint(${toLocation.lng}, ${toLocation.lat}), 4326)::geography
          WHERE id = ${id}
        `;
      }

      return collab;
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
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteCollaborationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as {id:string};

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
      select: { creatorId: true }
    });

    if (!collaboration) {
      return res.status(404).json({ success: false, message: 'Collaboration not found' });
    }

    if (collaboration.creatorId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete the collaboration' });
    }

    // Soft-delete: update status to CANCELLED and set deletedAt
    await prisma.collaboration.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'CANCELLED',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Collaboration deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting collaboration', { error });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { updateCollaborationController, deleteCollaborationController };
