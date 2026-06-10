import { Request, Response, NextFunction } from 'express';
import prisma from '../models';

/**
 * DB-level validation for onboarding.
 *
 * Structural validation (field types, lengths, valid category enum values) is
 * handled upstream by `validate(schemas.OnboardingRequest)`. This middleware
 * only enforces database-level business rules:
 *
 *   1. Username format — alphanumeric + underscores only (business rule not
 *      captured in the OpenAPI schema)
 *   2. Onboarding not already completed for this user
 *   3. Username not taken by a different user
 */
export const validateOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { username } = req.body as { username: string };
        const trimmedUsername = username.trim();

        // 1. Username character format (business rule beyond the spec's length check)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(trimmedUsername)) {
            res.status(400).json({
                success: false,
                message: 'Username can only contain letters, numbers, and underscores',
            });
            return;
        }

        // 2. Onboarding already completed check
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user?.onboardingCompleted) {
            res.status(400).json({ success: false, message: 'Onboarding is already completed' });
            return;
        }

        // 3. Username uniqueness check
        const existingUser = await prisma.user.findUnique({ where: { username: trimmedUsername } });
        if (existingUser && existingUser.id !== req.user.id) {
            res.status(400).json({ success: false, message: 'Username is already taken' });
            return;
        }

        // Normalize username for the controller
        req.body.username = trimmedUsername;
        next();
    } catch (error) {
        console.error('Error in onboarding DB validation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
