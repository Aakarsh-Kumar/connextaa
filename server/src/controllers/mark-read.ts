import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models'
import { Prisma } from '@prisma/client';

const markReadController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string ;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification id is required",
      });
    }

    const read = await prisma.notification.update({
        where:{
            id: id,
        },
        data:{
            isRead : true,
        }
    })

    res.status(200).json({ success: true, message: 'Notification Marked Read' });
  } catch (error) {
    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ){
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }
    logger.error('markReadController error', { error });
    res.status(500).json({ success:false, message: 'Internal server error' });
  }
};

const markReadAllController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const read = await prisma.notification.updateMany({
        where:{
            userId: userId,
        },
        data:{
            isRead : true,
        }
    })

    res.status(200).json({ success: true, message: 'All Notification Marked Read' });
  } catch (error) {
    logger.error('markReadAllController error', { error });
    res.status(500).json({ success:false, message: 'Internal server error' });
  }
};


export { markReadController,markReadAllController };