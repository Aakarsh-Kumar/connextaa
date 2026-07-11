import { createCollaborationsController } from '../controllers/create-collaboration';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
import isOnboarded from '../middlewares/onboardedCheck';
import validateTime from '../middlewares/validateTime';
import { getRequestsController, createJoinRequestController, approveJoinRequestController, rejectJoinRequestController, leaveRequestController, removeMemberController } from '../controllers/requests';
import { getCollaborationDetailsController } from '../controllers/collaboration-detail';
import { updateCollaborationController, deleteCollaborationController, completeCollaborationController } from '../controllers/update-collaboration';
import { getAllCollaborationsController } from '../controllers/get-collaborations-feed'

const router = Router();

router.get('/',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.CollaborationFeedResponse),
    getAllCollaborationsController,
)

router.post('/',
    isAuthenticated,
    isOnboarded,
    validate(schemas.CreateCollaborationRequest),
    validateTime,
    validateResponse(schemas.CreateCollaborationResponse),
    createCollaborationsController,
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
    validateTime,
    validateResponse(schemas.CollaborationResponse),
    updateCollaborationController,
);

router.delete('/:id',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    deleteCollaborationController,
);

router.patch('/:id/complete',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.CollaborationResponse),
    completeCollaborationController,
);

router.post('/:id/join',
    isAuthenticated,
    isOnboarded,
    validate(schemas.JoinRequest),
    validateResponse(schemas.SuccessResponse),
    createJoinRequestController,
)

router.post('/:id/leave',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    leaveRequestController,
)

router.delete("/:id/member/:memberId",
    isAuthenticated,
    isOnboarded,
    removeMemberController
);

router.get('/requests',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.PendingJoinRequestsResponse),
    getRequestsController,
)

router.post('/requests/:requestId/approve',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    approveJoinRequestController,
)

router.post('/requests/:requestId/reject',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.SuccessResponse),
    rejectJoinRequestController,
)

export default router;
