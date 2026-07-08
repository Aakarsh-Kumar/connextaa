import { Request, Response } from 'express';
import prisma from '../models';
import logger from '../utils/logger';
import { JoinStatus, CollaborationStatus } from '@prisma/client';

const getPendingRatingsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Find all collaborations where current user is APPROVED and collaboration status is COMPLETED
    const collaborations = await prisma.collaboration.findMany({
      where: {
        status: CollaborationStatus.COMPLETED,
        deletedAt: null,
        members: {
          some: {
            userId,
            joinStatus: JoinStatus.APPROVED,
          },
        },
      },
      include: {
        members: {
          where: {
            joinStatus: JoinStatus.APPROVED,
          },
          select: {
            userId: true,
          },
        },
        ratings: {
          where: {
            reviewerId: userId,
          },
          select: {
            reviewedUserId: true,
          },
        },
        chatRoom: {
          select: {
            id: true,
          },
        },
      },
    });

    const pending = [];

    for (const collab of collaborations) {
      const approvedMembersCount = collab.members.length;
      const expectedRatingsCount = Math.max(0, approvedMembersCount - 1);
      const ratingsGivenCount = collab.ratings.length;

      if (ratingsGivenCount < expectedRatingsCount) {
        pending.push({
          collaborationId: collab.id,
          chatRoomId: collab.chatRoom?.id || '',
          title: collab.title,
          completedAt: collab.updatedAt.toISOString(),
          remainingRatings: expectedRatingsCount - ratingsGivenCount,
        });
      }
    }

    return res.status(200).json({
      success: true,
      pending,
    });
  } catch (error) {
    logger.error('Error fetching pending ratings', { error });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getRatingQueueController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { collaborationId } = req.params as { collaborationId: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId, deletedAt: null },
      select: {
        status: true,
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

    if (collaboration.status !== CollaborationStatus.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Collaboration is not completed' });
    }

    // Verify current user is an approved participant
    const isUserApproved = collaboration.members.some((m) => m.userId === userId);
    if (!isUserApproved) {
      return res.status(403).json({ success: false, message: 'You are not an approved participant of this collaboration' });
    }

    // Find all ratings already submitted by the current user for this collaboration
    const ratingsGiven = await prisma.rating.findMany({
      where: {
        collaborationId,
        reviewerId: userId,
      },
      select: {
        reviewedUserId: true,
      },
    });

    const ratedUserIds = new Set(ratingsGiven.map((r) => r.reviewedUserId));

    // Filter queue (exclude current user and already rated users)
    const participants = collaboration.members
      .filter((m) => m.userId !== userId && !ratedUserIds.has(m.userId))
      .map((m) => ({
        id: m.user.id,
        name: m.user.name,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
      }));

    return res.status(200).json({
      success: true,
      participants,
    });
  } catch (error) {
    logger.error('Error fetching rating queue', { error });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const submitRatingController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      collaborationId,
      reviewedUserId,
      showUpRating,
      friendlyRating,
      safeRating,
      collaborativeRating,
      comment,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (userId === reviewedUserId) {
      return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId, deletedAt: null },
      select: {
        status: true,
        members: {
          where: {
            joinStatus: JoinStatus.APPROVED,
            userId: { in: [userId, reviewedUserId] },
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!collaboration) {
      return res.status(404).json({ success: false, message: 'Collaboration not found' });
    }

    if (collaboration.status !== CollaborationStatus.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Only completed collaborations can be rated' });
    }

    // Both reviewer and reviewee must be approved members (count should be 2)
    if (collaboration.members.length < 2) {
      return res.status(403).json({ success: false, message: 'Both you and the reviewed participant must be approved members of the collaboration' });
    }

    // Check for duplicate rating
    const existingRating = await prisma.rating.findUnique({
      where: {
        collaborationId_reviewerId_reviewedUserId: {
          collaborationId,
          reviewerId: userId,
          reviewedUserId,
        },
      },
    });

    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already rated this participant' });
    }

    // Create the rating
    await prisma.rating.create({
      data: {
        collaborationId,
        reviewerId: userId,
        reviewedUserId,
        showUpRating,
        friendlyRating,
        safeRating,
        collaborativeRating,
        comment,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
    });
  } catch (error) {
    logger.error('Error submitting rating', { error });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export {
  getPendingRatingsController,
  getRatingQueueController,
  submitRatingController,
};
