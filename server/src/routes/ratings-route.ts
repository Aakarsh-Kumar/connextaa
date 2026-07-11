import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import isOnboarded from '../middlewares/onboardedCheck';
import { schemas } from '../utils/zod';
import {
  getPendingRatingsController,
  getRatingQueueController,
  submitRatingController,
} from '../controllers/ratings';

const router = Router();

router.post(
  '/',
  isAuthenticated,
  isOnboarded,
  validate(schemas.SubmitRatingRequest),
  validateResponse(schemas.SuccessResponse),
  submitRatingController,
);

router.get(
  '/pending',
  isAuthenticated,
  isOnboarded,
  validateResponse(schemas.PendingRatingsResponse),
  getPendingRatingsController,
);

router.get(
  '/:collaborationId',
  isAuthenticated,
  isOnboarded,
  validateResponse(schemas.RatingQueueResponse),
  getRatingQueueController,
);

export default router;
