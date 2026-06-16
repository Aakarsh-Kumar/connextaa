import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';

const publicProfileController = async (req: Request, res: Response) => {
    try {
        if (!req.params.username) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;

        // Fetch user profile with categories in a single query
        const user = await prisma.user.findUnique({
            where: { username: username },
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
            prisma.collaboration.count({ where: { creatorId: user.id } }),
            prisma.collaborationMember.count({
                where: { userId: user.id, joinStatus: 'APPROVED' },
            }),
            prisma.collaboration.count({
                where: {
                    status: 'COMPLETED',
                    OR: [
                        { creatorId: user.id },
                        {
                            members: {
                                some: { userId: user.id, joinStatus: 'APPROVED' },
                            },
                        },
                    ],
                },
            }),
            prisma.rating.aggregate({
                where: { reviewedUserId: user.id },
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
        const overall = Number(((showUp + friendly + collaborative + safe) / 4).toFixed(2));

        const rating = {
            overall,
            showUpRating: Number(showUp.toFixed(1)),
            friendlyRating: Number(friendly.toFixed(1)),
            safeRating: Number(safe.toFixed(1)),
            collaborativeRating: Number(collaborative.toFixed(1)),
            totalReviews: ratingAgg._count._all,
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
