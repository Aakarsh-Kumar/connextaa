import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { Category, Prisma } from '@prisma/client';

const onboardingController = async (req: Request, res: Response) => {
    try {
        // Extract data from req.body (already validated by middleware)
        const { username, bio, categories } = req.body;

        // Check if req.user exists (TypeScript safety check)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        // Extract authenticated user ID from req.user
        const userId = req.user.id;

        // Perform database transaction with Prisma
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Update User model
            await tx.user.update({
                where: { id: userId },
                data: {
                    username,
                    bio,
                    onboardingCompleted: true,
                },
            });

            // Delete existing UserCategory relations for this user
            await tx.userCategory.deleteMany({
                where: { userId },
            });

            // Insert new UserCategory records for each selected category
            if (categories.length > 0) {
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
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Onboarding completed',
        });
    } catch (error) {
        logger.error('Onboarding controller error', { error });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export { onboardingController };