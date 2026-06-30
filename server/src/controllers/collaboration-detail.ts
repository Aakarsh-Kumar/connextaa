import { Request, Response } from 'express';
import prisma from '../models';
import logger from '../utils/logger';
import { JoinStatus } from '@prisma/client';

const getCollaborationDetailsController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collaboration = await prisma.collaboration.findFirst({
      where: {
        id,
        deletedAt: null,
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
          where: {
            joinStatus: JoinStatus.APPROVED,
          },
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

    if (!collaboration) {
      return res.status(404).json({ success: false, message: 'Collaboration not found' });
    }

    // Check my join status
    const myMemberRecord = await prisma.collaborationMember.findUnique({
      where: {
        collaborationId_userId: {
          collaborationId: id,
          userId,
        },
      },
      select: {
        joinStatus: true,
      },
    });

    const isCreator = collaboration.creatorId === userId;
    const myJoinStatus = isCreator ? JoinStatus.APPROVED : (myMemberRecord?.joinStatus ?? JoinStatus.LEFT);

    const totalApprovedCount = collaboration.members.length;
    const isMember = isCreator || myJoinStatus === JoinStatus.APPROVED;

    const members = isMember
      ? (collaboration.members || []).map((m: any) => ({
          id: m.user.id,
          name: m.user.name,
          username: m.user.username,
          avatarUrl: m.user.avatarUrl,
        }))
      : [];

    return res.status(200).json({
      success: true,
      collaboration: {
        id: collaboration.id,
        title: collaboration.title,
        description: collaboration.description,
        fromLocation: {
          name: collaboration.fromLocationName,
          lat: collaboration.fromLat,
          lng: collaboration.fromLng,
        },
        toLocation: {
          name: collaboration.toLocationName,
          lat: collaboration.toLat,
          lng: collaboration.toLng,
        },
        scheduledAt: collaboration.scheduledAt.toISOString(),
        maxMembers: collaboration.maxMembers,
        status: collaboration.status,
        creator: collaboration.creator,
        category: collaboration.category,
      },
      members,
      currentMembers: totalApprovedCount,
      isCreator,
      myJoinStatus,
    });
  } catch (error) {
    logger.error('Error fetching collaboration details', { error });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getCollaborationDetailsController };
