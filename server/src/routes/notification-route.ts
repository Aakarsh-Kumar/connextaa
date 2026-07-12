import notificationDeviceToken from '../controllers/notification-device-token';
import getNotificationsController from '../controllers/get-notification'

import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';
import isOnboarded from '../middlewares/onboardedCheck';

import { Router } from 'express';

const router = Router();

router.post(
  '/device-token',
  isAuthenticated,
  validate(schemas.DeviceTokenRequest),
  validateResponse(schemas.DeviceTokenRequest),
  isOnboarded,
  notificationDeviceToken,
);

router.get('/',isAuthenticated,isOnboarded,validateResponse(schemas.NotificationsResponse),getNotificationsController);
export default router;
