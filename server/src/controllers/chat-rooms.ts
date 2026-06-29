import { Request, Response } from 'express';
import prisma from '../models';
import logger from '../utils/logger';
import { CollaborationStatus, JoinStatus } from '@prisma/client';

const getRoomsController = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
        where: {
            collaboration: {
                members: {
                    some: {
                        userId: req.user?.id,
                        joinStatus: JoinStatus.APPROVED,
                    },
                },
                status: {
                    in: [
                        CollaborationStatus.OPEN,
                        CollaborationStatus.FULL,
                    ],
                },
                deletedAt: null,
            },
        },
        include: {
            collaboration: {
                select: {
                    id: true,
                    title: true,
                    category: true,
                    scheduledAt: true,
                    members: {
                        where: {
                            joinStatus: JoinStatus.APPROVED,
                        },
                        select: {
                            userId: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                            username: true,
                        },
                    },
                },
            },
        },
    });

    const data = rooms.map((room) => {
        const lastMsg = room.messages[0];
        return {
            roomId: room.id,
            collaboration: {
                id: room.collaboration.id,
                title: room.collaboration.title,
                category: room.collaboration.category,
                scheduledAt: room.collaboration.scheduledAt.toISOString(),
            },
            unreadCount: 0,
            memberCount: room.collaboration.members.length,
            lastMessage: lastMsg ? lastMsg.message : undefined,
            lastMessageSenderName: lastMsg ? lastMsg.sender.name : undefined,
        };
    });
    
    return res.status(200).json({
        success: true,
        data,
    });
  } catch (error) {
    logger.error('Error fetching chat rooms', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getRoomsController };
