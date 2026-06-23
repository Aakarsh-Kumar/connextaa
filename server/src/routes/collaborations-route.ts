import { createCollaborationsController } from '../controllers/create-collaboration';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
import isOnboarded from '../middlewares/onboardedCheck';
import validateTime from '../middlewares/validateTime';
import { getRequestsController, createJoinRequestController, approveJoinRequestController, rejectJoinRequestController } from '../controllers/requests';

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

router.get(
    '/requests',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.PendingJoinRequestsResponse),
    getRequestsController,
)

router.post(
    '/:id/join',
    isAuthenticated,
    isOnboarded,
    validate(schemas.JoinRequest),
    validateResponse(schemas.SuccessResponse),
    createJoinRequestController,
)

router.post(
    '/requests/:requestId/approve',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    approveJoinRequestController,
)

router.post(
    '/requests/:requestId/reject',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    rejectJoinRequestController,
)

export default router;
