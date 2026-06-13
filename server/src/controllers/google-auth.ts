import { Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { signToken } from '../utils/jwt';
import { GoogleAuthRequest } from '../middlewares/verifyGoogleAuthToken';
import { setAuthCookie } from "../utils/cookies";

// Helper function to generate a unique username
const generateUniqueUsername = async (email: string, name: string): Promise<string> => {
    // base username from email prefix or fallback to clean name
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername || name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
    
    // Check if it exists
    const existingUser = await prisma.user.findUnique({
        where: { username }
    });
    
    if (!existingUser) {
        return username;
    }
    
    // If it exists, append a random 4 digit number
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const candidate = `${username}${randomSuffix}`;
        const check = await prisma.user.findUnique({
            where: { username: candidate }
        });
        if (!check) {
            username = candidate;
            isUnique = true;
        }
        attempts++;
    }
    if (!isUnique) {
        // Fallback to timestamp/uuid suffix
        username = `${username}${Date.now().toString().slice(-6)}`;
    }
    return username;
};

const googleAuthController = async (req: GoogleAuthRequest, res: Response) => {
    try {
        const payload = req.googleUser;
        if (!payload) {
            res.status(401).json({ message: 'Unauthorized: Google token payload missing' });
            return;
        }

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || 'Google User';
        const avatarUrl = payload.picture || null;

        if (!googleId || !email) {
            res.status(400).json({ message: 'Invalid Google token payload' });
            return;
        }

        let user = await prisma.user.findUnique({
            where: { googleId },
        });

        if (user) {
            // Existing user
            const token = signToken({ id: user.id, email: user.email });
            setAuthCookie(res, token);
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    onboardingCompleted: user.onboardingCompleted,
                },
                message: 'Existing user found'
            });
            return;
        } else {
            // New user registration
            const username = await generateUniqueUsername(email, name);
            user = await prisma.user.create({
                data: {
                    googleId,
                    email,
                    name,
                    username,
                    avatarUrl,
                    onboardingCompleted: false
                }
            });

            const token = signToken({ id: user.id, email: user.email });
            setAuthCookie(res, token);
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    onboardingCompleted: false,
                },
                message: 'New user registred succesfully'
            });
            return;
        }
    } catch (error) {
        logger.error('Google authentication controller error', { error });
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

export { googleAuthController };
