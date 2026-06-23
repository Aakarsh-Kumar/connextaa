import { Request, Response, NextFunction } from 'express';
import prisma from '../models';
import { isValidUsername } from '../utils/validators';
//during the process of onboarding, it is checking the request's format's validity, username's validity and if the user is already onboarded.

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
        const validationResult = await isValidUsername(username, req.user.id);
        if (!validationResult.success) {
            res.status(400).json(validationResult);
            return;
        }

        // 2. Onboarding already completed check
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user?.onboardingCompleted) {
            res.status(400).json({ success: false, message: 'Onboarding is already completed' });
            return;
        }

        const trimmedUsername = username.trim();
        // Normalize username for the controller
        req.body.username = trimmedUsername;
        next();
    } catch (error) {
        console.error('Error in onboarding DB validation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
