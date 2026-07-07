import {Request, Response } from "express";
import logger from "../utils/logger";
import prisma from "../models"

const notificationDeviceToken = async (req: Request, res: Response) => {
    try{

    }catch(error){
        logger.error('notificationDeviceToken error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}