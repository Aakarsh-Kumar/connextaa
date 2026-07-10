import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { JoinStatus } from '@prisma/client';
import { getCollaborationsWithDistance, mapToFeedItem } from '../utils/collaborationQuery';

const publicProfileController = async (req: Request, res: Response) => {
    try {
        if (!req.params.username) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;

        // Fetch user profile with categories in a single query
        const user = await prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
                categories: {
                    select: { category: true },
                },
            },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Fetch stats in parallel for performance
        const [createdCount, joinedCount, completedCount, ratingAgg] = await Promise.all([
            prisma.collaboration.count({ where: { creatorId: user.id } }),
            prisma.collaborationMember.count({
                where: { userId: user.id, joinStatus: 'APPROVED' },
            }),
            prisma.collaboration.count({
                where: {
                    status: 'COMPLETED',
                    OR: [
                        { creatorId: user.id },
                        {
                            members: {
                                some: { userId: user.id, joinStatus: 'APPROVED' },
                            },
                        },
                    ],
                },
            }),
            prisma.rating.aggregate({
                where: { reviewedUserId: user.id },
                _avg: {
                    showUpRating: true,
                    friendlyRating: true,
                    collaborativeRating: true,
                    safeRating: true,
                },
                _count: { _all: true },
            }),
        ]);

        const showUp = ratingAgg._avg.showUpRating ?? 0;
        const friendly = ratingAgg._avg.friendlyRating ?? 0;
        const collaborative = ratingAgg._avg.collaborativeRating ?? 0;
        const safe = ratingAgg._avg.safeRating ?? 0;
        const overall = Number(((showUp + friendly + collaborative + safe) / 4).toFixed(2));

        const rating = {
            overall,
            showUpRating: Number(showUp.toFixed(1)),
            friendlyRating: Number(friendly.toFixed(1)),
            safeRating: Number(safe.toFixed(1)),
            collaborativeRating: Number(collaborative.toFixed(1)),
            totalReviews: ratingAgg._count._all,
        };

        // Flatten categories from [{ category: "STUDY" }] to ["STUDY"]
        const categories = user.categories.map((c) => c.category);

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                categories,
            },
            stats: {
                created: createdCount,
                joined: joinedCount,
                completed: completedCount,
            },
            rating,
        });

    } catch (error) {
        logger.error('publicProfileController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const userCollaborationsController = async (req: Request, res: Response) => {
    try {
        const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
        const cursor = req.query.cursor as string | undefined;
        const limit = Math.min(Number(req.query.limit ?? 2), 30);
        
        // Parse user coordinates if available
        const userLat = req.query.lat ? Number(req.query.lat) : undefined;
        const userLng = req.query.lng ? Number(req.query.lng) : undefined;

        const viewerId = req.user?.id;

        // Resolve the profile user by username
        const profileUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!profileUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch collaborations using PostGIS spatial logic
        const collaborations = await getCollaborationsWithDistance({
            creatorId: profileUser.id,
            cursor,
            limit,
            userLat,
            userLng,
            statuses: ['OPEN', 'FULL', 'COMPLETED'],
        });

        // If viewer is authenticated, bulk-fetch their membership statuses for all returned collaborations
        const viewerMemberships: Map<string, JoinStatus> = new Map();
        if (viewerId && collaborations.length > 0) {
            const collabIds = collaborations.map((c) => c.id);
            const memberships = await prisma.collaborationMember.findMany({
                where: {
                    collaborationId: { in: collabIds },
                    userId: viewerId,
                },
                select: { collaborationId: true, joinStatus: true },
            });
            memberships.forEach((m) => viewerMemberships.set(m.collaborationId, m.joinStatus));
        }

        const data = collaborations.map((c) => 
            mapToFeedItem(c, {
                viewerId,
                viewerMemberships,
            })
        );

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
        logger.error('userCollaborationsController error', { error });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { publicProfileController, userCollaborationsController };
