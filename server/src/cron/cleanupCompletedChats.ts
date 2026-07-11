import prisma from '../models';
import logger from '../utils/logger';
import { CollaborationStatus } from '@prisma/client';

export async function autoCompleteOldCollaborations() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma.collaboration.updateMany({
      where: {
        status: {
          in: [
            CollaborationStatus.OPEN,
            CollaborationStatus.FULL,
          ],
        },
        scheduledAt: {
          lte: sevenDaysAgo,
        },
        deletedAt: null,
      },
      data: {
        status: CollaborationStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    logger.info(`Auto-completed ${result.count} collaborations`);

  } catch (error) {
    logger.error('Error auto-completing old collaborations:', error);
  }
}

export async function cleanupExpiredChats() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find collaborations that are COMPLETED, completedAt <= now - 7 days, and have a chatRoom
    const expiredCollaborations = await prisma.collaboration.findMany({
      where: {
        status: CollaborationStatus.COMPLETED,
        deletedAt: null,
        completedAt: {
          lte: sevenDaysAgo,
        },
        chatRoom: {
          isNot: null,
        },
      },
      select:{
          id:true,
          chatRoom:{
              select:{
                  id:true
              }
          }
      }
    });

    if (expiredCollaborations.length === 0) {
      return;
    }

    logger.info(`Cleaning up expired chats for ${expiredCollaborations.length} collaborations`);

    await Promise.all(
      expiredCollaborations.map(async (collab) => {
      try{
        if (!collab.chatRoom) return;

        const roomId = collab.chatRoom.id;

        await prisma.$transaction(async (tx) => {
          await tx.message.deleteMany({
            where: { roomId },
          });

          await tx.chatMember.deleteMany({
            where: { roomId },
          });

          await tx.chatRoom.delete({
            where: { id: roomId },
          });
        });
      }
      catch(err){
        logger.error(`Failed to clean up chat room ${collab.id}:`, err);  
      }
      })
    );
    logger.info(`Successfully cleaned up ${expiredCollaborations.length} chat rooms`);
  } catch (error) {
    logger.error('Error cleaning up expired chats:', error);
  }
}
