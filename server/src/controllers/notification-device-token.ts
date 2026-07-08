import {Request, Response } from "express";
import logger from "../utils/logger";
import prisma from "../models"
import { PrismaClient } from "@prisma/client";

const notificationDeviceToken = async (req: Request, res: Response) => {
    try{
        //token and platform exists or not
        //store userid in a variable
        const userid = req.user?.id

        if (!userid) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const deviceToken = await prisma.deviceToken.create({
            data: {
                userId: userid,
                token: req.body.deviceToken,
                platform: req.body.platform
            }

        })
        if(!deviceToken) {
            return res.status(400).json({ success: false, message: 'Failed to create device token' });
        }

        res.status(201).json({ success: true, message: 'Device Registered successfully' });
    }catch(error){
        logger.error('notificationDeviceToken error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
export default notificationDeviceToken;