import { OAuth2Client, TokenPayload } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";

const client = new OAuth2Client(
    config.googleClientId,
);

export interface GoogleAuthRequest extends Request {
    googleUser?: TokenPayload;
}

export const verifyGoogleAuthToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.body?.idToken || req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: config.googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        (req as GoogleAuthRequest).googleUser = payload;
        next();
    } catch (error) {
        console.error('Error verifying Google authentication token:', error); //TODO: to be removed in production
        res.status(401).json({ message: `Unauthorized: ${error}` });
    }
};