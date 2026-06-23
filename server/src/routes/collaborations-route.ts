import { createCollaborationsController } from '../controllers/create-collaboration';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validateOnboarding } from '../middlewares/validateOnboarding';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
import isOnboarded from '../middlewares/onboardedCheck';
import validateTime from '../middlewares/validateTime';

const router = Router();

router.post(
    '/',
    isAuthenticated,
    isOnboarded,
    validate(schemas.CreateCollaborationRequest),
    validateTime,
    validateResponse(schemas.CreateCollaborationResponse),
    createCollaborationsController,
)

export default router;
