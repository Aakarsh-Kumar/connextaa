import { meProfileController } from '../controllers/me-profile';
import { Router } from 'express';
import { isAuthenticated, optionalAuth } from '../middlewares/auth';
import {
  publicProfileController,
  userCollaborationsController,
} from '../controllers/public-profile';
import {
  updateMeProfileController,
  usernameValidityController,
} from '../controllers/update-me-profile';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
const router = Router();

router.get(
  '/me',
  isAuthenticated,
  validateResponse(schemas.ProfileResponse),
  meProfileController,
);

router.patch(
  '/me',
  isAuthenticated,
  validate(schemas.UpdateProfileRequest),
  validateResponse(schemas.ProfileResponse),
  updateMeProfileController,
);

router.get(
  '/check-username',
  isAuthenticated,
  validateResponse(schemas.SuccessResponse),
  usernameValidityController,
);

router.get(
  '/:username',
  validateResponse(schemas.ProfileResponse),
  publicProfileController,
);

router.get(
  '/:username/collaborations',
  optionalAuth,
  validateResponse(schemas.CollaborationFeedResponse),
  userCollaborationsController,
);

export default router;
