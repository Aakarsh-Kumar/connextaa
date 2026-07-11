import { Request, Response } from "express";
import prisma from "../models";
import logger from "../utils/logger";

export const getTrendingController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Step 1: Get the IDs of the top 3 trending collaborations
    const trendingIds = await prisma.$queryRaw<{ id: string }[]>`
      SELECT c.id
      FROM collaborations c
      LEFT JOIN collaboration_members cm
        ON cm.collaboration_id = c.id
        AND cm.join_status = 'APPROVED'
      WHERE
        c.deleted_at IS NULL
        AND c.status = 'OPEN'
        AND c.scheduled_at >= NOW()
      GROUP BY c.id
      ORDER BY
        COUNT(cm.id) DESC,
        c.created_at DESC
      LIMIT 3;
    `;

    // No trending collaborations found
    if (trendingIds.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 3,
          total: 0,
          hasMore: false,
        },
      });
      return;
    }

    // Step 2: Fetch complete collaboration details
    const collaborations = await prisma.collaboration.findMany({
      where: {
        id: {
          in: trendingIds.map((c) => c.id),
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
            username: true,
            avatarUrl: true,
            bio: true,
            ratingsReceived: {
              select: {
                showUpRating: true,
                friendlyRating: true,
                safeRating: true,
                collaborativeRating: true,
              },
            },
          },
        },
        members: {
          where: {
            joinStatus: "APPROVED",
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Preserve SQL ordering
    const orderMap = new Map(
      trendingIds.map((item, index) => [item.id, index])
    );

    collaborations.sort(
      (a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!
    );

    // Step 3: Format response
    const data = collaborations.map((collaboration) => {
      const ratings = collaboration.creator.ratingsReceived;

      const rating =
        ratings.length === 0
          ? 0
          : Number(
              (
                ratings.reduce((sum, r) => {
                  return (
                    sum +
                    (
                      r.showUpRating +
                      r.friendlyRating +
                      r.safeRating +
                      r.collaborativeRating
                    ) /
                      4
                  );
                }, 0) / ratings.length
              ).toFixed(1)
            );

      return {
        id: collaboration.id,
        category: collaboration.category,
        title: collaboration.title,
        description: collaboration.description,
        scheduledAt: collaboration.scheduledAt,
        status: collaboration.status,

        currentMembers: collaboration.members.length,
        maxMembers: collaboration.maxMembers,

        creator: {
          id: collaboration.creator.id,
          email: collaboration.creator.email,
          name: collaboration.creator.name,
          onboardingCompleted:
            collaboration.creator.onboardingCompleted,
          username: collaboration.creator.username,
          avatarUrl: collaboration.creator.avatarUrl,
          bio: collaboration.creator.bio,
        },

        rating,

        // Trending endpoint doesn't calculate distance
        distanceMeters: null,

        fromLocation: {
          name: collaboration.fromLocationName,
          lat: collaboration.fromLat,
          lng: collaboration.fromLng,
        },

        toLocation: {
          name: collaboration.toLocationName,
          lat: collaboration.toLat,
          lng: collaboration.toLng,
        },
      };
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: 1,
        limit: 3,
        total: data.length,
        hasMore: false,
      },
    });
  } catch (error) {
    logger.error("Error fetching trending collaborations:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trending collaborations.",
    });
  }
};