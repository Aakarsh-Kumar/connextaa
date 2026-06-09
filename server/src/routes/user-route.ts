import { meProfileController } from '../controllers/me-profile';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
const router = Router();

router.get('/me', isAuthenticated, meProfileController);

export default router;
