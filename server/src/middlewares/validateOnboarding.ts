import { Request, Response, NextFunction } from 'express';
import prisma from '../models';
import { Category } from '@prisma/client';

export const validateOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, bio, categories } = req.body;

        // 1. Authenticated User Check (should already be set by isAuthenticated middleware)
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        //check if the user onboarding is already completed
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (user && user.onboardingCompleted) {
            res.status(400).json({ success: false, message: 'Onboarding is already completed' });
            return;
        }

        // 2. Username Validation
        if (typeof username !== 'string') {
            res.status(400).json({ success: false, message: 'Username is required and must be a string' });
            return;
        }

        const trimmedUsername = username.trim();
        if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
            res.status(400).json({ success: false, message: 'Username must be between 3 and 20 characters long' });
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(trimmedUsername)) {
            res.status(400).json({ success: false, message: 'Username can only contain alphanumeric characters and underscores' });
            return;
        }

        // Check username uniqueness in DB
        const existingUser = await prisma.user.findUnique({
            where: { username: trimmedUsername }
        });

        if (existingUser && existingUser.id !== req.user.id) {
            res.status(400).json({ success: false, message: 'Username is already taken' });
            return;
        }

        // 3. Bio Validation
        if (bio !== undefined && bio !== null) {
            if (typeof bio !== 'string') {
                res.status(400).json({ success: false, message: 'Bio must be a string' });
                return;
            }
            if (bio.length > 160) {
                res.status(400).json({ success: false, message: 'Bio cannot exceed 160 characters' });
                return;
            }
        }

        // 4. Categories Validation
        if (!Array.isArray(categories)) {
            res.status(400).json({ success: false, message: 'Categories must be an array' });
            return;
        }

        const validCategories = Object.values(Category) as string[];
        for (const cat of categories) {
            if (typeof cat !== 'string' || !validCategories.includes(cat)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid category: '${cat}'. Valid categories are: ${validCategories.join(', ')}`
                });
                return;
            }
        }

        // Sanitize request body before passing to controller
        req.body.username = trimmedUsername;
        if (bio !== undefined && bio !== null) {
            req.body.bio = bio.trim();
        }

        next();
    } catch (error) {
        console.error('Error in onboarding validation middleware:', error);
        res.status(500).json({ success: false, message: 'Internal server error during validation' });
    }
};
