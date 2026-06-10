import { meProfileController } from '../controllers/me-profile';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { updateMeProfileController } from '../controllers/update-me-profile';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';

const router = Router();

/**
 * GET /users/me
 * 1. isAuthenticated        — verifies JWT
 * 2. validateResponse()     — dev-only: asserts response matches AuthMeResponse schema
 * 3. meProfileController    — returns current user profile
 */
router.get(
  '/me',
  isAuthenticated,
  validateResponse(schemas.ProfileResponse),
  meProfileController,
);

/**
 * PATCH /users/me
 * 1. isAuthenticated           — verifies JWT
 * 2. validate(body)            — Zod: { name?, username?, bio?, avatarUrl? } (all optional)
 * 3. validateResponse()        — dev-only: asserts response matches AuthMeResponse schema
 * 4. updateMeProfileController — applies profile updates
 */
router.patch(
  '/me',
  isAuthenticated,
  validate(schemas.UpdateProfileRequest),
  validateResponse(schemas.ProfileResponse),
  updateMeProfileController,
);

export default router;
