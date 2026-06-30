import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { Prisma } from '@prisma/client';

const createCollaborationsController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Atomically create collaboration, creator membership, chat room, and chat membership
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const collaboration = await tx.collaboration.create({
                data: {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    fromLocationName: req.body.fromLocation.name,
                    fromLat: req.body.fromLocation.lat,
                    fromLng: req.body.fromLocation.lng,
                    toLocationName: req.body.toLocation.name,
                    toLat: req.body.toLocation.lat,
                    toLng: req.body.toLocation.lng,
                    scheduledAt: new Date(req.body.scheduledAt),
                    maxMembers: req.body.maxMembers,
                    creatorId: user.id,
                    members: {
                        create: {
                            userId: user.id,
                            role: 'CREATOR',
                            joinStatus: 'APPROVED',
                            joinMessage: 'CREATOR'
                        }
                    },
                    chatRoom: {
                        create: {
                            members: {
                                create: {
                                    userId: user.id,
                                }
                            }
                        }
                    }
                },
                include: {
                    chatRoom: true,
                }
            });
            // 2. Populate unsupported geography point columns via raw PostGIS
            await tx.$executeRaw`
                UPDATE collaborations
                SET from_point = ST_SetSRID(
                    ST_MakePoint(
                        ${req.body.fromLocation.lng},
                        ${req.body.fromLocation.lat}
                    ),
                    4326
                )::geography,
                to_point = ST_SetSRID(
                    ST_MakePoint(
                        ${req.body.toLocation.lng},
                        ${req.body.toLocation.lat}
                    ),
                    4326
                )::geography
                WHERE id = ${collaboration.id}
            `;
            return res.status(201).json({
                success: true,
                collaborationId: collaboration.id,
                chatRoomId: collaboration.chatRoom?.id,
            });
        })
    } catch (error) {
        logger.error('Error creating collaboration', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { createCollaborationsController };
