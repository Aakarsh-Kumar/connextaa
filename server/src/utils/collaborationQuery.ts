import prisma from '../models';
import { JoinStatus, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CollaborationDistanceFilter {
  /** Filter collaborations created by this user id */
  creatorId?: string;
  /** If provided, only return collaborations not soft-deleted */
  excludeDeleted?: boolean;
  /** Optional cursor (collaboration.id) for cursor-based pagination */
  cursor?: string;
  /** Maximum number of results to return (default 10, max 30) */
  limit?: number;
  /** If provided, distances are computed relative to this point */
  userLat?: number;
  userLng?: number;
}

export interface CollaborationWithDistance {
  // Scalars from $queryRaw
  id: string;
  creator_id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  scheduled_at: Date;
  max_members: number;
  from_location_name: string;
  from_lat: number | null;
  from_lng: number | null;
  to_location_name: string;
  to_lat: number | null;
  to_lng: number | null;
  created_at: Date;
  deleted_at: Date | null;
  /** Present only when userLat/userLng are provided */
  distance_meters: number | null;
  // Relations — fetched via Prisma after the raw query
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    email: string;
    bio: string | null;
    onboardingCompleted: boolean;
  };
  members: { userId: string }[];
  ratings: {
    showUpRating: number;
    friendlyRating: number;
    collaborativeRating: number;
    safeRating: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches collaborations with optional PostGIS distance calculation.
 *
 * When `userLat` and `userLng` are supplied the query computes
 * `LEAST(ST_Distance(from_point, userPoint), ST_Distance(to_point, userPoint))`
 * entirely inside PostgreSQL, leveraging the spatial index.
 *
 * When coordinates are omitted, `distance_meters` will be `null`.
 *
 * Use this helper in:
 *  - Feed          (GET /collaborations)
 *  - Public Profile Activities (GET /users/:username/collaborations)
 *  - My Activities
 *  - AI Matching
 *  - Future Search
 */
export async function getCollaborationsWithDistance(
  filters: CollaborationDistanceFilter,
): Promise<CollaborationWithDistance[]> {
  const {
    creatorId,
    excludeDeleted = true,
    cursor,
    limit = 10,
    userLat,
    userLng,
  } = filters;

  const safeLimitValue = Math.min(limit, 30);
  const hasLocation = userLat != null && userLng != null && !isNaN(userLat) && !isNaN(userLng);

  // ── Build raw SQL ────────────────────────────────────────────────────────
  // We use $queryRaw because Prisma's findMany cannot compute ST_Distance.
  // Cursor pagination: ORDER BY created_at DESC, then skip rows with
  // created_at < cursor_created_at (or equal created_at but id < cursor_id)
  // to maintain stable order.

  let rawRows: any[];

  if (hasLocation) {
    // Full PostGIS distance path
    const userPoint = `ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography`;

    if (creatorId) {
      // Filter by creator id
      if (cursor) {
        rawRows = await prisma.$queryRaw<any[]>`
          WITH cursor_row AS (
            SELECT created_at, id FROM collaborations WHERE id = ${cursor}
          ),
          cd AS (
            SELECT
              c.*,
              LEAST(
                ST_Distance(c.from_point, ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography),
                ST_Distance(c.to_point,   ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography)
              ) AS distance_meters
            FROM collaborations c
            WHERE
              c.creator_id = ${creatorId}
              ${excludeDeleted ? Prisma.sql`AND c.deleted_at IS NULL` : Prisma.empty}
          )
          SELECT cd.* FROM cd, cursor_row
          WHERE (cd.created_at < cursor_row.created_at)
             OR (cd.created_at = cursor_row.created_at AND cd.id != cursor_row.id)
          ORDER BY cd.created_at DESC
          LIMIT ${safeLimitValue}
        `;
      } else {
        rawRows = await prisma.$queryRaw<any[]>`
          SELECT
            c.*,
            LEAST(
              ST_Distance(c.from_point, ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography),
              ST_Distance(c.to_point,   ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography)
            ) AS distance_meters
          FROM collaborations c
          WHERE
            c.creator_id = ${creatorId}
            AND c.deleted_at IS NULL
          ORDER BY c.created_at DESC
          LIMIT ${safeLimitValue}
        `;
      }
    } else {
      // No creator filter — full feed
      if (cursor) {
        rawRows = await prisma.$queryRaw<any[]>`
          WITH cursor_row AS (
            SELECT created_at, id FROM collaborations WHERE id = ${cursor}
          ),
          cd AS (
            SELECT
              c.*,
              LEAST(
                ST_Distance(c.from_point, ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography),
                ST_Distance(c.to_point,   ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography)
              ) AS distance_meters
            FROM collaborations c
            WHERE c.deleted_at IS NULL
          )
          SELECT cd.* FROM cd, cursor_row
          WHERE (cd.created_at < cursor_row.created_at)
             OR (cd.created_at = cursor_row.created_at AND cd.id != cursor_row.id)
          ORDER BY cd.created_at DESC
          LIMIT ${safeLimitValue}
        `;
      } else {
        rawRows = await prisma.$queryRaw<any[]>`
          SELECT
            c.*,
            LEAST(
              ST_Distance(c.from_point, ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography),
              ST_Distance(c.to_point,   ST_SetSRID(ST_MakePoint(${userLng!}, ${userLat!}), 4326)::geography)
            ) AS distance_meters
          FROM collaborations c
          WHERE c.deleted_at IS NULL
          ORDER BY c.created_at DESC
          LIMIT ${safeLimitValue}
        `;
      }
    }
  } else {
    // No coordinates — use Prisma findMany (no distance computation needed)
    const prismaCols = await prisma.collaboration.findMany({
      where: {
        ...(creatorId ? { creatorId } : {}),
        ...(excludeDeleted ? { deletedAt: null } : {}),
      },
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      take: safeLimitValue,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        creatorId: true,
        category: true,
        title: true,
        description: true,
        status: true,
        scheduledAt: true,
        maxMembers: true,
        fromLocationName: true,
        fromLat: true,
        fromLng: true,
        toLocationName: true,
        toLat: true,
        toLng: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    // Shape to match the raw query row format
    rawRows = prismaCols.map((c) => ({
      id: c.id,
      creator_id: c.creatorId,
      category: c.category,
      title: c.title,
      description: c.description,
      status: c.status,
      scheduled_at: c.scheduledAt,
      max_members: c.maxMembers,
      from_location_name: c.fromLocationName,
      from_lat: c.fromLat,
      from_lng: c.fromLng,
      to_location_name: c.toLocationName,
      to_lat: c.toLat,
      to_lng: c.toLng,
      created_at: c.createdAt,
      deleted_at: c.deletedAt,
      distance_meters: null,
    }));
  }

  if (rawRows.length === 0) return [];

  // ── Fetch relations via Prisma (no N+1 — single query per relation) ─────
  const collabIds = rawRows.map((r) => r.id as string);

  const prismaRelations = await prisma.collaboration.findMany({
    where: { id: { in: collabIds } },
    select: {
      id: true,
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
      members: {
        where: { joinStatus: JoinStatus.APPROVED },
        select: { userId: true },
      },
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

  const relationsMap = new Map(prismaRelations.map((r) => [r.id, r]));

  // ── Merge & return ────────────────────────────────────────────────────────
  return rawRows
    .filter((row) => relationsMap.has(row.id))
    .map((row) => {
      const rel = relationsMap.get(row.id)!;
      return {
        ...row,
        distance_meters:
          row.distance_meters != null ? Math.round(Number(row.distance_meters)) : null,
        creator: rel.creator,
        members: rel.members,
        ratings: rel.ratings,
      } as CollaborationWithDistance;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared mapping helper — converts raw row → CollaborationFeedItem shape
// ─────────────────────────────────────────────────────────────────────────────

export function mapToFeedItem(
  c: CollaborationWithDistance,
  opts: {
    viewerId?: string;
    viewerMemberships?: Map<string, JoinStatus>;
  } = {},
) {
  const { viewerId, viewerMemberships } = opts;
  const currentMembers = c.members.length;

  const ratingEntries = c.ratings;
  const ratingAvg =
    ratingEntries.length > 0
      ? Number(
          (
            ratingEntries.reduce(
              (sum, r) =>
                sum +
                (r.showUpRating + r.friendlyRating + r.collaborativeRating + r.safeRating) / 4,
              0,
            ) / ratingEntries.length
          ).toFixed(1),
        )
      : null;

  const isCreatorViewing = viewerId != null && viewerId === c.creator.id;
  const viewerStatus = viewerMemberships?.get(c.id);
  const isJoined = isCreatorViewing || viewerStatus === JoinStatus.APPROVED;
  const isPending = !isJoined && viewerStatus === JoinStatus.PENDING;

  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    status: c.status,
    scheduledAt: (c.scheduled_at instanceof Date
      ? c.scheduled_at
      : new Date(c.scheduled_at)
    ).toISOString(),
    maxMembers: c.max_members,
    currentMembers,
    distanceMeters: c.distance_meters,
    rating: ratingAvg,
    creator: c.creator,
    fromLocation: {
      name: c.from_location_name,
      lat: c.from_lat,
      lng: c.from_lng,
    },
    toLocation: {
      name: c.to_location_name,
      lat: c.to_lat,
      lng: c.to_lng,
    },
    // Viewer-specific — passthrough allows extra fields
    isJoined,
    isPending,
  };
}
