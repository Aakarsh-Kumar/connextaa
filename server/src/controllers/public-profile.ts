import { Request, Response } from 'express';
import logger from '../utils/logger';
import prisma from '../models';
import { JoinStatus } from '@prisma/client';

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
        // Optional: requesting user (may not be authenticated — public endpoint)
        const viewerId = req.user?.id;

        // Resolve the profile user by username
        const profileUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!profileUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Cursor-based pagination — newest collaborations first (createdAt DESC)
        const collaborations = await prisma.collaboration.findMany({
            where: {
                creatorId: profileUser.id,
                deletedAt: null,
            },
            ...(cursor
                ? {
                    skip: 1,
                    cursor: { id: cursor },
                  }
                : {}),
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                status: true,
                scheduledAt: true,
                maxMembers: true,
                fromLocationName: true,
                fromLat: true,
                fromLng: true,
                toLocationName: true,
                toLat: true,
                toLng: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatarUrl: true,
                        email: true,
                        bio: true,
                        onboardingCompleted: true,
                    },
                },
                // Count approved members inline
                members: {
                    where: { joinStatus: JoinStatus.APPROVED },
                    select: { userId: true },
                },
                // Ratings for the collaboration (to compute avg)
                ratings: {
                    select: {
                        showUpRating: true,
                        friendlyRating: true,
                        collaborativeRating: true,
                        safeRating: true,
                    },
                },
            },
        });

        // If viewer is authenticated, bulk-fetch their membership statuses for all returned collaborations
        const viewerMemberships: Map<string, JoinStatus> = new Map();
        if (viewerId) {
            const collabIds = collaborations.map((c) => c.id);
            if (collabIds.length > 0) {
                const memberships = await prisma.collaborationMember.findMany({
                    where: {
                        collaborationId: { in: collabIds },
                        userId: viewerId,
                    },
                    select: { collaborationId: true, joinStatus: true },
                });
                memberships.forEach((m) => viewerMemberships.set(m.collaborationId, m.joinStatus));
            }
        }

        const data = collaborations.map((c) => {
            const currentMembers = c.members.length;

            // Compute average creator rating for this collaboration's entries
            const ratingEntries = c.ratings;
            const ratingAvg = ratingEntries.length > 0
                ? Number((ratingEntries.reduce((sum, r) =>
                    sum + (r.showUpRating + r.friendlyRating + r.collaborativeRating + r.safeRating) / 4, 0
                  ) / ratingEntries.length).toFixed(1))
                : null;

            // Determine viewer membership status
            const isCreatorViewing = viewerId === c.creator.id;
            const viewerStatus = viewerMemberships.get(c.id);
            const isJoined = isCreatorViewing || viewerStatus === JoinStatus.APPROVED;
            const isPending = !isJoined && viewerStatus === JoinStatus.PENDING;

            return {
                id: c.id,
                title: c.title,
                description: c.description,
                category: c.category,
                status: c.status,
                scheduledAt: c.scheduledAt.toISOString(),
                maxMembers: c.maxMembers,
                currentMembers,
                distanceMeters: null,
                rating: ratingAvg,
                creator: c.creator,
                fromLocation: {
                    name: c.fromLocationName,
                    lat: c.fromLat,
                    lng: c.fromLng,
                },
                toLocation: {
                    name: c.toLocationName,
                    lat: c.toLat,
                    lng: c.toLng,
                },
                // Viewer-specific: passthrough allows extra fields in schema
                isJoined,
                isPending,
            };
        });

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
