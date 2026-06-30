import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import prisma from '../models';

const isOnboarded = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const onboarded = prisma.user.findUnique({
            where: {
                id: user.id,
                onboardingCompleted: true,
            }
        })
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!onboarded) {
            return res.status(403).json({ success: false, message: 'User is not onboarded' });
        }
        next();
    } catch (error) {
        logger.error('Error in onboardedCheck middleware:', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
export default isOnboarded;