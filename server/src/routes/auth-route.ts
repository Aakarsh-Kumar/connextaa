import { googleAuthController } from '../controllers/google-auth';
import { verifyGoogleAuthToken } from '../middlewares/verifyGoogleAuthToken';

import { Router } from 'express';
const router = Router();

router.post('/google', verifyGoogleAuthToken, googleAuthController);

export default router;
