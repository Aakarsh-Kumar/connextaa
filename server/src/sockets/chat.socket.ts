import { Server, Socket } from 'socket.io';
import prisma from '../models';
import logger from '../utils/logger';

export function registerChatSockets(io: Server, socket: Socket) {
  const user = (socket as any).user;
  console.log(user);
  if (!user) return;

  socket.on('join_room', async ({ roomId }) => {
    try {
      // Validate membership in Prisma to keep it secure
      const membership = await prisma.chatMember.findUnique({
        where: { roomId_userId: { roomId, userId: user.id } },
      });
      if (!membership) {
        // Fallback: Check if they are approved collaboration member
        const chatRoom = await prisma.chatRoom.findUnique({
          where: { id: roomId },
          select: { collaborationId: true, collaboration: { select: { creatorId: true } } },
        });

        if (chatRoom) {
          const isCreator = chatRoom.collaboration.creatorId === user.id;
          const collabMember = isCreator
            ? { joinStatus: 'APPROVED' }
            : await prisma.collaborationMember.findUnique({
                where: { collaborationId_userId: { collaborationId: chatRoom.collaborationId, userId: user.id } },
                select: { joinStatus: true },
              });

          if (collabMember && collabMember.joinStatus === 'APPROVED') {
            // Backfill and join
            await prisma.chatMember.create({
              data: { roomId, userId: user.id },
            });
            socket.join(roomId);
            logger.info(`User ${user.id} joined room ${roomId} (lazy backfill)`);
            return;
          }
        }
        logger.warn(`Unauthorized room join attempt: user ${user.id} for room ${roomId}`);
        return;
      }

      socket.join(roomId);
      logger.info(`User ${user.id} joined room ${roomId}`);
    } catch (err) {
      logger.error('Error joining room', { err, roomId, userId: user.id });
    }
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    logger.info(`User ${user.id} left room ${roomId}`);
  });

  socket.on('typing_start', ({ roomId, name }) => {
    socket.to(roomId).emit('typing', {
      userId: user.id,
      name: name.split(' ')[0] ?? user.name.split(' ')[0] ??   user.username ??   'Someone',
    });
  });

  socket.on('typing_stop', ({ roomId }) => {
    socket.to(roomId).emit('stop_typing');
  });

  socket.on('disconnect', () => {
    logger.info(`User ${user.id} disconnected`);
  });
}
