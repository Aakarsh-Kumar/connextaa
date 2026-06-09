import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';

const publicProfileController = async (req: Request, res: Response) => {
    try {
        console.log(req.params.userId);
        if (!req.params.userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userId = Array.isArray(req.params.userId)?req.params.userId[0]:req.params.userId;

        // Fetch user profile with categories in a single query
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
                categories: {
                    select: { category: true },
                },
            },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Fetch stats in parallel for performance
        const [createdCount, joinedCount, completedCount, ratingAgg] = await Promise.all([
          prisma.collaboration.count({ where: { creatorId: userId } }),
          prisma.collaborationMember.count({
            where: { userId, joinStatus: 'APPROVED' },
          }),
          prisma.collaboration.count({
            where: {
              status: 'COMPLETED',
              OR: [
                { creatorId: userId },
                {
                  members: {
                    some: { userId, joinStatus: 'APPROVED' },
                  },
                },
              ],
            },
          }),
          prisma.rating.aggregate({
            where: { reviewedUserId: userId },
            _avg: {
              showUpRating: true,
              friendlyRating: true,
              collaborativeRating: true,
              safeRating: true,
            },
            _count: { _all: true },
          }),
        ]);

        const showUp = ratingAgg._avg.showUpRating ?? 0;
        const friendly = ratingAgg._avg.friendlyRating ?? 0;
        const collaborative = ratingAgg._avg.collaborativeRating ?? 0;
        const safe = ratingAgg._avg.safeRating ?? 0;

        const overall = Number(((showUp + friendly + collaborative + safe) / 4).toFixed(1));

        const rating = {
          count: ratingAgg._count._all,
          breakdown: {
            showUp: Number(showUp.toFixed(1)),
            friendly: Number(friendly.toFixed(1)),
            collaborative: Number(collaborative.toFixed(1)),
            safe: Number(safe.toFixed(1)),
          },
          overall,
        };

        // Flatten categories from [{ category: "STUDY" }] to ["STUDY"]
        const categories = user.categories.map((c) => c.category);

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                categories,
            },
            stats: {
                created: createdCount,
                joined: joinedCount,
                completed: completedCount,
            },
            rating,
        });

    } catch (error) {
        logger.error('publicProfileController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { publicProfileController };
