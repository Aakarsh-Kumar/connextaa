import { NextFunction, Request, Response } from "express";

const validateTime = async (req: Request, res: Response, next: NextFunction) => {
    const scheduledTime = new Date(req.body.scheduledAt);
    if (isNaN(scheduledTime.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid scheduled time' });
    }
    const now = new Date();
    const minimumAllowedTime = new Date(now.getTime() - 2 * 60 * 1000)
    if (scheduledTime.getTime() < minimumAllowedTime.getTime()) {
        return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
    }

    next();
}

export default validateTime;