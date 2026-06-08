import { googleAuthController } from '../controllers/google-auth';
import { verifyGoogleAuthToken } from '../middlewares/verifyGoogleAuthToken';
import { userAuth } from '../controllers/user-auth'
import { isAuthenticated } from '../middlewares/auth';

import { Router } from 'express';
const router = Router();

router.post('/google', verifyGoogleAuthToken, googleAuthController);
router.get('/me', isAuthenticated, userAuth)

export default router;
