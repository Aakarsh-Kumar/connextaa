import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { isValidUsername } from '../utils/validators';

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

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(username && { username }),
                ...(bio && { bio }),
                ...(categories && { categories }),
            },
            include: {
                categories: {
                    select: { category: true },
                },
            },
        });



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
        });
    } catch (error) {
        logger.error('updateMeProfileController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { updateMeProfileController };
