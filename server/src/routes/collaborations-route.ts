import { createCollaborationsController } from '../controllers/create-collaboration';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
import isOnboarded from '../middlewares/onboardedCheck';
import validateTime from '../middlewares/validateTime';
import { getRequestsController, createJoinRequestController, approveJoinRequestController, rejectJoinRequestController, leaveRequestController } from '../controllers/requests';
import { getCollaborationDetailsController } from '../controllers/collaboration-detail';
import { updateCollaborationController, deleteCollaborationController } from '../controllers/update-collaboration';

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


router.get(
    '/:id',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.CollaborationResponse),
    getCollaborationDetailsController
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

router.post('/:id/leave',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    leaveRequestController,
)

router.get('/:id',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.CollaborationResponse),
    getCollaborationDetailsController,
)

router.patch('/:id',
    isAuthenticated,
    isOnboarded,
    validate(schemas.UpdateCollaborationRequest),
    validateResponse(schemas.CollaborationResponse),
    updateCollaborationController,
);

router.delete('/:id',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    deleteCollaborationController,
);

export default router;
