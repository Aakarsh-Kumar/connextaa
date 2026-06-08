import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res
            .status(401)
            .json({
                status: 'error',
                message: 'Missing or invalid Authorization header',
            });
        return;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const decoded = verifyToken(token);
        // Attach decoded payload to req.user
        (req as any).user = decoded;
        next();
    } catch (err) {
        res
            .status(401)
            .json({ status: 'error', message: 'Invalid or expired token' });
        return;
    }
};

export { isAuthenticated };
