import { onboardingController } from '../controllers/onboarding'
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validateOnboarding } from '../middlewares/validateOnboarding';
const router = Router();

router.post('/', isAuthenticated, validateOnboarding, onboardingController);

export default router;
