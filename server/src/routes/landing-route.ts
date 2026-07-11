import { getTrendingController } from '../controllers/trending-collborations';

import { Router } from 'express';
const router = Router();

router.get('/trending', getTrendingController);

export default router;
