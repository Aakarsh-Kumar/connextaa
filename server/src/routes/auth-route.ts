import { googleAuthController } from '../controllers/google-auth';
import { verifyGoogleAuthToken } from '../middlewares/verifyGoogleAuthToken';
import { userAuth } from '../controllers/user-auth';
import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
import { Router } from 'express';
import logoutAuthController from '../controllers/logout-auth';

const router = Router();

/**
 * POST /auth/google
 * 1. validate(body)         — ensures { idToken: string } is present
 * 2. verifyGoogleAuthToken  — verifies the token with Google OAuth
 * 3. validateResponse()     — dev-only: asserts response matches AuthResponse schema
 * 4. googleAuthController   — issues JWT, creates/finds user
 */
router.post(
    '/google',
    validate(schemas.GoogleAuthRequest),
    verifyGoogleAuthToken,
    validateResponse(schemas.AuthResponse),
    googleAuthController,
);

/**
 * GET /auth/me
 * 1. isAuthenticated        — verifies JWT
 * 2. validateResponse()     — dev-only: asserts response matches AuthMeResponse schema
 * 3. userAuth               — returns current user data
 */
router.get(
    '/me',
    isAuthenticated,
    validateResponse(schemas.AuthMeResponse),
    userAuth,
);

router.post('/logout', isAuthenticated, validateResponse(schemas.SuccessResponse), logoutAuthController)

export default router;
