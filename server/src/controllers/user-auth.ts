import { Request, Response } from 'express';
import prisma from '../models';
import logger from '../utils/logger';

/**
 * Controller to fetch details of the currently authenticated user.
 * Expected response format:
 * {
 *   "success": true,
 *   "user": {
 *     "id": "uuid",
 *     "email": "aakarsh@gmail.com",
 *     "name": "Aakarsh",
 *     "username": "aakarsh",
 *     "avatarUrl": "...",
 *     "onboardingCompleted": true
 *   }
 * }
 */
export const userAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: User session not found'
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                avatarUrl: true,
                onboardingCompleted: true
            }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        logger.error('Error in userAuth controller:', { error });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
