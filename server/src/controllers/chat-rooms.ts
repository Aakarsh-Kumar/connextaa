import { Request, Response } from 'express';
import prisma from '../models';
import logger from '../utils/logger';
import { CollaborationStatus, JoinStatus } from '@prisma/client';
import { getIO } from '../sockets/socket';

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

const getMessagesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const roomId = req.params.id as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(Number(req.query.limit ?? 30), 100);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Guard: check ChatMember (room membership) as the source of truth.
    // If a row is missing but the user IS an approved CollaborationMember / creator,
    // backfill the ChatMember row automatically (handles members approved before this
    // logic existed) and allow access. Non-members still receive 403.
    let chatMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
      select: { id: true },
    });

    if (!chatMember) {
      // Resolve the collaboration for this room so we can check CollaborationMember
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { collaborationId: true, collaboration: { select: { creatorId: true } } },
      });

      if (!chatRoom) {
        return res.status(404).json({ success: false, message: 'Chat room not found' });
      }

      const isCreator = chatRoom.collaboration.creatorId === userId;

      const collabMember = isCreator
        ? { joinStatus: JoinStatus.APPROVED }
        : await prisma.collaborationMember.findUnique({
            where: { collaborationId_userId: { collaborationId: chatRoom.collaborationId, userId } },
            select: { joinStatus: true },
          });

      if (!collabMember || collabMember.joinStatus !== JoinStatus.APPROVED) {
        return res.status(403).json({ success: false, message: 'You are not a member of this chat room' });
      }

      // Backfill the missing ChatMember row
      chatMember = await prisma.chatMember.create({
        data: { roomId, userId },
        select: { id: true },
      });
    }

    // Fetch newest messages first (DESC). Client reverses pages for display.
    // Cursor = oldest message id seen so far, so next page goes further back.
    const messages = await prisma.message.findMany({
      where: { roomId },
      ...(cursor
        ? {
            skip: 1,          // skip the cursor item itself
            cursor: { id: cursor },
          }
        : {}),
      take: limit,
      orderBy: { createdAt: 'desc' },  // newest first
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    // nextCursor = the oldest message in this page (last item, since DESC order)
    // Client passes this as cursor to load messages even older than these.
    const nextCursor = messages.length === limit
      ? messages[messages.length - 1].id
      : null;

    const data = messages.map((m) => ({
      id: m.id,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
    }));

    return res.status(200).json({ success: true, data, nextCursor });
  } catch (error) {
    logger.error('Error fetching messages', { error });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sendMessageController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const roomId = req.params.id as string;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    if (message.length > 300) {
      return res.status(400).json({ success: false, message: 'Message length cannot exceed 300 characters' });
    }

    // Guard: check ChatMember (room membership) as the source of truth.
    // Backfill ChatMember if they are an approved collaboration member or creator.
    let chatMember = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
      select: { id: true },
    });

    if (!chatMember) {
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { collaborationId: true, collaboration: { select: { creatorId: true } } },
      });

      if (!chatRoom) {
        return res.status(404).json({ success: false, message: 'Chat room not found' });
      }

      const isCreator = chatRoom.collaboration.creatorId === userId;

      const collabMember = isCreator
        ? { joinStatus: JoinStatus.APPROVED }
        : await prisma.collaborationMember.findUnique({
            where: { collaborationId_userId: { collaborationId: chatRoom.collaborationId, userId } },
            select: { joinStatus: true },
          });

      if (!collabMember || collabMember.joinStatus !== JoinStatus.APPROVED) {
        return res.status(403).json({ success: false, message: 'You are not a member of this chat room' });
      }

      // Backfill the missing ChatMember row
      await prisma.chatMember.create({
        data: { roomId, userId },
      });
    }

    // Save to database
    const savedMessage = await prisma.message.create({
      data: {
        roomId,
        senderId: userId,
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    const messageData = {
      id: savedMessage.id,
      message: savedMessage.message,
      createdAt: savedMessage.createdAt.toISOString(),
      sender: savedMessage.sender,
    };

    // Broadcast to the socket room
    try {
      getIO().to(roomId).emit('new_message', messageData);
    } catch (socketErr) {
      logger.error('Error broadcasting message via Socket.IO', socketErr);
    }

    return res.status(201).json(messageData);
  } catch (error) {
    logger.error('Error sending message', { error });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getRoomsController, getMessagesController, sendMessageController };
