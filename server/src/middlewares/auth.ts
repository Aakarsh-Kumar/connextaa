import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Cookie auth
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Bearer auth fallback
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.replace('Bearer ', '').trim();
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication token missing',
    });
  }

  try {
    const decoded = verifyToken(token);

    (req as any).user = decoded;

    next();
  } catch {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};
export { isAuthenticated };
