import { onboardingController } from '../controllers/onboarding';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validateOnboarding } from '../middlewares/validateOnboarding';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';

const router = Router();

router.post('/',
    isAuthenticated,
    validate(schemas.OnboardingRequest),
    validateOnboarding,
    validateResponse(schemas.SuccessResponse),
    onboardingController,
);

export default router;
