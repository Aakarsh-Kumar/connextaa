import { meProfileController } from '../controllers/me-profile';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { publicProfileController } from '../controllers/public-profile';
const router = Router();

router.get('/me', isAuthenticated, meProfileController);
router.get('/:userId',publicProfileController);

export default router;
