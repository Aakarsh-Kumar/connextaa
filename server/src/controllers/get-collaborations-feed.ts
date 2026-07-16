import { Request, Response } from 'express';
import prisma from '../models';
import logger from '../utils/logger';
import { getCollaborationsWithDistance, mapToFeedItem } from '../utils/collaborationQuery';
import { JoinStatus } from '@prisma/client';
import { Category } from '@prisma/client';

const getAllCollaborationsController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const currentUserId = user?.id;

        if (!currentUserId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Parse query params
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
        const search = typeof req.query.search === 'string' && req.query.search.trim() !== '' ? req.query.search.trim(): undefined;
        
        // Validate Category filter
        const validCategories = Object.values(Category);
        const category = typeof req.query.category === 'string' && validCategories.includes(req.query.category as Category)
            ? req.query.category
            : undefined;

        // Parse coordinates and radius
        const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
        const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
        
        let radius: number | undefined = undefined;
        if (req.query.radius !== undefined && req.query.radius !== 'undefined' && req.query.radius !== '') {
            const parsedRadius = parseFloat(req.query.radius as string);
            if (!isNaN(parsedRadius)) {
                radius = parsedRadius;
            }
        }

        const userLat = lat !== undefined && !isNaN(lat) ? lat : undefined;
        const userLng = lng !== undefined && !isNaN(lng) ? lng : undefined;

        // Parse date and time filters
        const date = typeof req.query.date === 'string' && req.query.date.trim() !== '' ? req.query.date.trim() : undefined;
        const time = typeof req.query.time === 'string' && req.query.time.trim() !== '' ? req.query.time.trim() : undefined;

        let startDate: Date | undefined = undefined;
        let endDate: Date | undefined = undefined;

        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const t = time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00';
            startDate = new Date(`${date}T${t}:00`);
            endDate = new Date(`${date}T23:59:59.999`);
            
            // Validate constructed Date objects
            if (isNaN(startDate.getTime())) startDate = undefined;
            if (isNaN(endDate.getTime())) endDate = undefined;
        } else if (time && /^\d{2}:\d{2}$/.test(time)) {
            // If only time is provided, default to today's date in local server time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const localTodayStr = `${year}-${month}-${day}`;
            startDate = new Date(`${localTodayStr}T${time}:00`);
            endDate = new Date(`${localTodayStr}T23:59:59.999`);
            
            if (isNaN(startDate.getTime())) startDate = undefined;
            if (isNaN(endDate.getTime())) endDate = undefined;
        }

        // Fetch collaborations with distance using helper
        const collaborations = await getCollaborationsWithDistance({
            excludeDeleted: true,
            cursor,
            limit,
            userLat,
            userLng,
            category,
            radius,
            search,
            excludeUserId: currentUserId,
            orderByDistance: true,
            statuses: ['OPEN'],
            startDate,
            endDate,
        });

        // Bulk-fetch membership statuses for all returned collaborations for the current viewer
        const viewerMemberships: Map<string, JoinStatus> = new Map();
        if (collaborations.length > 0) {
            const collabIds = collaborations.map((c) => c.id);
            const memberships = await prisma.collaborationMember.findMany({
                where: {
                    collaborationId: { in: collabIds },
                    userId: currentUserId,
                },
                select: { collaborationId: true, joinStatus: true },
            });
            memberships.forEach((m) => viewerMemberships.set(m.collaborationId, m.joinStatus));
        }

        // Map to Feed Items (CollaborationFeedItem shape)
        const data = collaborations.map((c) => 
            mapToFeedItem(c, {
                viewerId: currentUserId,
                viewerMemberships,
            })
        );

        // Compute next cursor for cursor-based pagination
        const nextCursor = collaborations.length === limit
            ? collaborations[collaborations.length - 1].id
            : null;

        return res.status(200).json({
            success: true,
            data,
            nextCursor,
            pagination: {
                hasMore: nextCursor !== null,
            },
        });
    } catch (error) {
        logger.error('getAllCollaborationsController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { getAllCollaborationsController };
