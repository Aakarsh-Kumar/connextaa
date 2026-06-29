import { getRoomsController, getMessagesController } from '../controllers/chat-rooms';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { validate, validateResponse } from '../middlewares/validate';
import isOnboarded from '../middlewares/onboardedCheck';
import { schemas } from '../utils/zod';

const router = Router();

router.get(
    '/rooms',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.ChatRoomsResponse),
    getRoomsController
)

router.get('/rooms/:id/messages',
    isAuthenticated,
    isOnboarded,
    validateResponse(schemas.MessagesResponse),
    getMessagesController
)

export default router;

