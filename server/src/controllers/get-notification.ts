import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { NotificationType } from '@prisma/client';

const getNotificationsController = async (req: Request, res: Response) => {
    try{
        const user= req.user?.id as string
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

        const notifications = await prisma.notification.findMany({
            take: limit+1,
            skip: cursor ? 1 : undefined,
            cursor: cursor
                ? {
                      id: cursor,
                  }
                : undefined,
            where:{
                userId: user
            },
            select: {
                id: true,
                type: true,
                title: true,
                body: true,
                referenceId:true,
                isRead: true,
                createdAt: true
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],

        });


        const hasNextPage = notifications.length > limit;

        if (hasNextPage) {
            notifications.pop();
        }
        // Compute next cursor for cursor-based pagination
        const nextCursor = hasNextPage
             ? notifications[notifications.length - 1].id
             : null;
        res.status(200).json({
            success : true,
            data: notifications,
            nextCursor,
        })
    }catch(error){
        logger.error('getNotificationController error: ', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export default getNotificationsController;