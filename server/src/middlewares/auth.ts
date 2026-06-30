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

// Decodes the JWT if present but does NOT block unauthenticated requests.
// Use on public routes where knowing who the viewer is enriches the response.
const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.replace('Bearer ', '').trim();
  }

  if (token) {
    try {
      (req as any).user = verifyToken(token);
    } catch {
      // Invalid token — treat as unauthenticated, don't block
    }
  }

  next();
};

export { isAuthenticated, optionalAuth };
