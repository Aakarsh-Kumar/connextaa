import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';

const meProfileController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;

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
        const [createdCount, joinedCount, completedCount] = await Promise.all([
            // Collaborations created by this user
            prisma.collaboration.count({
                where: { creatorId: userId },
            }),

            // Collaborations the user has joined (approved membership)
            prisma.collaborationMember.count({
                where: {
                    userId,
                    joinStatus: 'APPROVED',
                },
            }),

            // Completed collaborations where the user is a member (approved) or creator
            prisma.collaboration.count({
                where: {
                    status: 'COMPLETED',
                    OR: [
                        { creatorId: userId },
                        {
                            members: {
                                some: {
                                    userId,
                                    joinStatus: 'APPROVED',
                                },
                            },
                        },
                    ],
                },
            }),
        ]);

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
        });
    } catch (error) {
        logger.error('meProfileController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { meProfileController };
