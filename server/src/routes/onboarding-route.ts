import { onboardingController } from '../controllers/onboarding';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validateOnboarding } from '../middlewares/validateOnboarding';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';

const router = Router();

/**
 * POST /onboarding
 * 1. isAuthenticated        — verifies JWT
 * 2. validate(body)         — Zod: { username (3–20 chars), bio? (≤160 chars), categories[] }
 * 3. validateOnboarding     — DB: username regex, not already onboarded, username not taken
 * 4. validateResponse()     — dev-only: asserts response matches SuccessResponse schema
 * 5. onboardingController   — persists username/bio/categories, marks onboarding complete
 */
router.post(
    '/',
    isAuthenticated,
    validate(schemas.OnboardingRequest),
    validateOnboarding,
    validateResponse(schemas.SuccessResponse),
    onboardingController,
);

export default router;
