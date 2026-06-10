import { meProfileController } from '../controllers/me-profile';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { publicProfileController } from '../controllers/public-profile';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod'
const router = Router();

router.get('/me', isAuthenticated, meProfileController);
router.get('/:userId',validateResponse(schemas.ProfileResponse),publicProfileController);

export default router;
