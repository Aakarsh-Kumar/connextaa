import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { isValidUsername } from '../utils/validators';
import { Category, Prisma } from '@prisma/client';


const updateMeProfileController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;
        const { username, bio, categories } = req.body;

        // Validate username format
        const validationResult = await isValidUsername(username, userId);
        if (!validationResult.success) {
            res.status(400).json(validationResult);
            return;
        }

        // Update user profile and categories in transaction
        const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Update user profile
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    ...(username && { username }),
                    ...(bio && { bio }),
                },
                include: {
                    categories: {
                        select: { category: true },
                    },
                },
            });

            // 1. Delete existing category relationships
            await tx.userCategory.deleteMany({
                where: { userId },
            });

            // 2. Create new category relationships
            if (categories && categories.length > 0) {
                await Promise.all(
                    categories.map((category: Category) =>
                        tx.userCategory.create({
                            data: {
                                userId,
                                category,
                            },
                        })
                    )
                );
            }

            // Return updated user data
            return user;
        });

        // Fetch stats in parallel for performance
        const [createdCount, joinedCount, completedCount, ratingAgg] =
            await Promise.all([
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
        const overall = Number(
            ((showUp + friendly + collaborative + safe) / 4).toFixed(2),
        );

        const rating = {
            overall,
            showUpRating: Number(showUp.toFixed(1)),
            friendlyRating: Number(friendly.toFixed(1)),
            safeRating: Number(safe.toFixed(1)),
            collaborativeRating: Number(collaborative.toFixed(1)),
            totalReviews: ratingAgg._count._all,
        };

        // Flatten categories from [{ category: "STUDY" }] to ["STUDY"]
        const formattedCategories = updatedUser.categories.map((c) => c.category);

        res.status(200).json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                username: updatedUser.username,
                categories: formattedCategories,
                avatarUrl: updatedUser.avatarUrl,
                bio: updatedUser.bio,
            },
            stats: {
                created: createdCount,
                joined: joinedCount,
                completed: completedCount,
            },
            rating,
        });
    } catch (error) {
        logger.error('updateMeProfileController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export { updateMeProfileController };