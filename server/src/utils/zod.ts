import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const Category = z.enum([
  'CARPOOLING',
  'EVENTS',
  'STUDY',
  'PROFESSIONAL',
  'SPORTS',
  'TRIPS',
  'OTHER',
]);
const CollaborationStatus = z.enum(['OPEN', 'FULL', 'COMPLETED', 'CANCELLED']);
const User = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string(),
    onboardingCompleted: z.boolean(),
    username: z.string(),
    avatarUrl: z.string().nullish(),
    bio: z.string().nullish(),
  })
  .passthrough();
const Location = z
  .object({
    name: z.string().min(3).max(200),
    lat: z.number().gte(-90).lte(90),
    lng: z.number().gte(-180).lte(180),
  })
  .passthrough();
const CollaborationFeedItem = z
  .object({
    id: z.string(),
    category: Category,
    title: z.string(),
    description: z.string(),
    scheduledAt: z.string().datetime({ offset: true }),
    status: CollaborationStatus,
    currentMembers: z.number().int(),
    maxMembers: z.number().int(),
    distanceMeters: z.number().nullable(),
    rating: z.number().nullable(),
    creator: User,
    fromLocation: Location,
    toLocation: Location,
  })
  .passthrough();
const PaginationMeta = z
  .object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    hasMore: z.boolean(),
  })
  .partial()
  .passthrough();
const CollaborationFeedResponse = z
  .object({
    success: z.boolean(),
    data: z.array(CollaborationFeedItem),
    pagination: PaginationMeta,
  })
  .partial()
  .passthrough();
const GoogleAuthRequest = z
  .object({ idToken: z.string().max(2048) })
  .passthrough();
const AuthResponse = z
  .object({ success: z.boolean(), user: User })
  .passthrough();
const ErrorResponse = z
  .object({ success: z.boolean(), message: z.string() })
  .passthrough();
const AuthMeResponse = z
  .object({ success: z.boolean(), user: User })
  .passthrough();
const SuccessResponse = z
  .object({ success: z.boolean(), message: z.string() })
  .passthrough();
const OnboardingRequest = z
  .object({
    username: z.string().min(3).max(20),
    bio: z.string().max(160).optional(),
    categories: z.array(Category),
  })
  .passthrough();
const ProfileResponse = z
  .object({
    success: z.boolean(),
    user: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        username: z.string(),
        avatarUrl: z.string().nullish(),
        bio: z.string().nullish(),
        categories: z.array(Category),
      })
      .passthrough(),
    stats: z
      .object({
        created: z.number().int(),
        joined: z.number().int(),
        completed: z.number().int(),
      })
      .passthrough(),
    rating: z
      .object({
        overall: z.number(),
        showUpRating: z.number(),
        friendlyRating: z.number(),
        safeRating: z.number(),
        collaborativeRating: z.number(),
        totalReviews: z.number().int(),
      })
      .passthrough(),
  })
  .passthrough();
const UpdateProfileRequest = z
  .object({
    username: z.string().min(3).max(20),
    bio: z.string().max(160),
    categories: z.array(Category),
  })
  .partial()
  .passthrough();
const CreateCollaborationRequest = z
  .object({
    category: Category,
    title: z.string().min(3).max(40),
    description: z.string().min(10).max(250),
    fromLocation: Location,
    toLocation: Location,
    scheduledAt: z.string().datetime({ offset: true }),
    maxMembers: z.number().int().gte(2).lte(30),
  })
  .passthrough();
const CreateCollaborationResponse = z
  .object({
    success: z.boolean(),
    collaborationId: z.string().uuid(),
    chatRoomId: z.string(),
  })
  .partial()
  .passthrough();
const Collaboration = z
  .object({
    id: z.string(),
    category: Category,
    title: z.string().min(3).max(40),
    description: z.string().min(10).max(250),
    fromLocation: Location,
    toLocation: Location,
    scheduledAt: z.string().datetime({ offset: true }),
    maxMembers: z.number().int(),
    status: CollaborationStatus,
    creator: User,
  })
  .passthrough();
const JoinStatus = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'LEFT']);
const CollaborationResponse = z
  .object({
    success: z.boolean().optional(),
    collaboration: Collaboration,
    members: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            username: z.string(),
            avatarUrl: z.string().nullable(),
          })
          .partial()
          .passthrough(),
      )
      .optional(),
    currentMembers: z.number().int(),
    isCreator: z.boolean(),
    myJoinStatus: JoinStatus,
  })
  .passthrough();
const UpdateCollaborationRequest = z
  .object({
    title: z.string().min(3).max(40),
    description: z.string().min(10).max(250),
    scheduledAt: z.string().datetime({ offset: true }),
    maxMembers: z.number().int().gte(2).lte(30),
  })
  .partial()
  .passthrough();
const JoinRequest = z
  .object({ message: z.string().max(300) })
  .partial()
  .passthrough();
const PendingJoinRequestsResponse = z
  .object({
    success: z.boolean(),
    data: z.array(
      z
        .object({
          requestId: z.string(),
          collaboration: z
            .object({
              collaborationId: z.string(),
              title: z.string(),
              category: Category,
            })
            .partial()
            .passthrough(),
          joinMessage: z.string().nullable(),
          requestedAt: z.string().datetime({ offset: true }),
          status: JoinStatus,
          user: z
            .object({
              id: z.string(),
              name: z.string(),
              username: z.string(),
              avatarUrl: z.string().nullable(),
            })
            .partial()
            .passthrough(),
        })
        .partial()
        .passthrough(),
    ),
  })
  .passthrough();
const ChatRoom = z
  .object({
    roomId: z.string(),
    collaboration: z
      .object({
        id: z.string(),
        title: z.string(),
        category: Category,
        scheduledAt: z.string().datetime({ offset: true }),
      })
      .passthrough(),
    unreadCount: z.number().int(),
    lastMessage: z.string(),
    memberCount: z.number().int(),
    lastMessageSenderName: z.string(),
    remainingRatings: z.number().int(),
  })
  .passthrough();
const ChatRoomsResponse = z
  .object({ success: z.boolean(), data: z.array(ChatRoom) })
  .partial()
  .passthrough();
const SingleChatRoomResponse = z
  .object({ success: z.boolean(), data: ChatRoom })
  .passthrough();
const Message = z
  .object({
    id: z.string(),
    message: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    sender: User,
  })
  .partial()
  .passthrough();
const MessagesResponse = z
  .object({ success: z.boolean(), data: z.array(Message) })
  .partial()
  .passthrough();
const SendMessageRequest = z
  .object({ message: z.string().min(1).max(300) })
  .passthrough();
const SubmitRatingRequest = z
  .object({
    collaborationId: z.string(),
    reviewedUserId: z.string(),
    showUpRating: z.number().int().gte(1).lte(5),
    friendlyRating: z.number().int().gte(1).lte(5),
    safeRating: z.number().int().gte(1).lte(5),
    collaborativeRating: z.number().int().gte(1).lte(5),
    comment: z.string().optional(),
  })
  .passthrough();
const PendingRatingItem = z
  .object({
    collaborationId: z.string(),
    chatRoomId: z.string(),
    title: z.string(),
    completedAt: z.string(),
    remainingRatings: z.number().int(),
  })
  .passthrough();
const PendingRatingsResponse = z
  .object({ success: z.boolean(), pending: z.array(PendingRatingItem) })
  .passthrough();
const RatingQueueUser = z
  .object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullish(),
  })
  .passthrough();
const RatingQueueResponse = z
  .object({ participants: z.array(RatingQueueUser) })
  .passthrough();
const NotificationType = z.enum([
  'JOIN_REQUEST',
  'JOIN_APPROVED',
  'JOIN_REJECTED',
  'CHAT_CREATED',
  'NEW_MESSAGE',
  'COLLABORATION_COMPLETED',
  'COLLABORATION_CANCELLED',
]);
const Notification = z
  .object({
    id: z.string().uuid(),
    type: NotificationType,
    title: z.string(),
    body: z.string(),
    referenceId: z.string(),
    isRead: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .passthrough();
const NotificationsResponse = z
  .object({
    success: z.boolean(),
    data: z.array(Notification),
    nextCursor: z.string().nullable(),
  })
  .passthrough();
const DeviceTokenRequest = z
  .object({ deviceToken: z.string().max(500), platform: z.string().max(50) })
  .passthrough();

export const schemas = {
  Category,
  CollaborationStatus,
  User,
  Location,
  CollaborationFeedItem,
  PaginationMeta,
  CollaborationFeedResponse,
  GoogleAuthRequest,
  AuthResponse,
  ErrorResponse,
  AuthMeResponse,
  SuccessResponse,
  OnboardingRequest,
  ProfileResponse,
  UpdateProfileRequest,
  CreateCollaborationRequest,
  CreateCollaborationResponse,
  Collaboration,
  JoinStatus,
  CollaborationResponse,
  UpdateCollaborationRequest,
  JoinRequest,
  PendingJoinRequestsResponse,
  ChatRoom,
  ChatRoomsResponse,
  SingleChatRoomResponse,
  Message,
  MessagesResponse,
  SendMessageRequest,
  SubmitRatingRequest,
  PendingRatingItem,
  PendingRatingsResponse,
  RatingQueueUser,
  RatingQueueResponse,
  NotificationType,
  Notification,
  NotificationsResponse,
  DeviceTokenRequest,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/auth/google',
    alias: 'postAuthgoogle',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ idToken: z.string().max(2048) }).passthrough(),
      },
    ],
    response: AuthResponse,
    errors: [
      {
        status: 400,
        description: `Invalid Google Token`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'post',
    path: '/auth/logout',
    alias: 'postAuthlogout',
    requestFormat: 'json',
    response: SuccessResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/auth/me',
    alias: 'getAuthme',
    requestFormat: 'json',
    response: AuthMeResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/chat/rooms',
    alias: 'getChatrooms',
    requestFormat: 'json',
    response: ChatRoomsResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/chat/rooms/:roomId',
    alias: 'getChatroomsRoomId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'roomId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SingleChatRoomResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/chat/rooms/:roomId/messages',
    alias: 'getChatroomsRoomIdmessages',
    requestFormat: 'json',
    parameters: [
      {
        name: 'roomId',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'page',
        type: 'Query',
        schema: z.number().int().optional().default(1),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional().default(50),
      },
    ],
    response: MessagesResponse,
  },
  {
    method: 'post',
    path: '/chat/rooms/:roomId/messages',
    alias: 'postChatroomsRoomIdmessages',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ message: z.string().min(1).max(300) }).passthrough(),
      },
      {
        name: 'roomId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Message,
  },
  {
    method: 'get',
    path: '/collaborations',
    alias: 'getCollaborations',
    requestFormat: 'json',
    parameters: [
      {
        name: 'page',
        type: 'Query',
        schema: z.number().int().optional().default(1),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional().default(20),
      },
      {
        name: 'category',
        type: 'Query',
        schema: z
          .enum([
            'CARPOOLING',
            'EVENTS',
            'STUDY',
            'PROFESSIONAL',
            'SPORTS',
            'TRIPS',
            'OTHER',
          ])
          .optional(),
      },
      {
        name: 'lat',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'lng',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'radius',
        type: 'Query',
        schema: z.number().optional().default(10),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'date',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'time',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: CollaborationFeedResponse,
  },
  {
    method: 'post',
    path: '/collaborations',
    alias: 'postCollaborations',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateCollaborationRequest,
      },
    ],
    response: CreateCollaborationResponse,
    errors: [
      {
        status: 400,
        description: `Validation Error`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/collaborations/:id',
    alias: 'getCollaborationsId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: CollaborationResponse,
    errors: [
      {
        status: 404,
        description: `Collaboration Not Found`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'patch',
    path: '/collaborations/:id',
    alias: 'patchCollaborationsId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UpdateCollaborationRequest,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: CollaborationResponse,
    errors: [
      {
        status: 403,
        description: `Only Creator Can Update`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'delete',
    path: '/collaborations/:id',
    alias: 'deleteCollaborationsId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'patch',
    path: '/collaborations/:id/complete',
    alias: 'patchCollaborationsIdcomplete',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: CollaborationResponse,
    errors: [
      {
        status: 400,
        description: `Invalid Request or Status Transition`,
        schema: ErrorResponse,
      },
      {
        status: 403,
        description: `Only Creator Can Complete`,
        schema: ErrorResponse,
      },
      {
        status: 404,
        description: `Collaboration Not Found`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'post',
    path: '/collaborations/:id/join',
    alias: 'postCollaborationsIdjoin',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z
          .object({ message: z.string().max(300) })
          .partial()
          .passthrough()
          .optional(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'post',
    path: '/collaborations/:id/leave',
    alias: 'postCollaborationsIdleave',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'delete',
    path: '/collaborations/:id/member/:memberId',
    alias: 'deleteCollaborationsIdmemberMemberId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'memberId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'get',
    path: '/collaborations/requests',
    alias: 'getCollaborationsrequests',
    requestFormat: 'json',
    response: PendingJoinRequestsResponse,
  },
  {
    method: 'post',
    path: '/collaborations/requests/:requestId/approve',
    alias: 'postCollaborationsrequestsRequestIdapprove',
    requestFormat: 'json',
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'post',
    path: '/collaborations/requests/:requestId/reject',
    alias: 'postCollaborationsrequestsRequestIdreject',
    requestFormat: 'json',
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'get',
    path: '/landing/trending',
    alias: 'getLandingtrending',
    requestFormat: 'json',
    response: CollaborationFeedResponse,
  },
  {
    method: 'get',
    path: '/notifications',
    alias: 'getNotifications',
    requestFormat: 'json',
    parameters: [
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional().default(20),
      },
    ],
    response: NotificationsResponse,
  },
  {
    method: 'patch',
    path: '/notifications/:id/read',
    alias: 'patchNotificationsIdread',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'post',
    path: '/notifications/device-token',
    alias: 'postNotificationsdeviceToken',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: DeviceTokenRequest,
      },
    ],
    response: z.void(),
  },
  {
    method: 'patch',
    path: '/notifications/read-all',
    alias: 'patchNotificationsreadAll',
    requestFormat: 'json',
    response: SuccessResponse,
  },
  {
    method: 'post',
    path: '/onboarding',
    alias: 'postOnboarding',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: OnboardingRequest,
      },
    ],
    response: SuccessResponse,
    errors: [
      {
        status: 400,
        description: `Validation Error`,
        schema: ErrorResponse,
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'post',
    path: '/ratings',
    alias: 'postRatings',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SubmitRatingRequest,
      },
    ],
    response: SuccessResponse,
    errors: [
      {
        status: 400,
        description: `Invalid Rating`,
        schema: ErrorResponse,
      },
      {
        status: 403,
        description: `Cannot Rate User`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/ratings/:collaborationId',
    alias: 'getRatingsCollaborationId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'collaborationId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: RatingQueueResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: ErrorResponse,
      },
      {
        status: 404,
        description: `Collaboration Not Found`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/ratings/pending',
    alias: 'getRatingspending',
    requestFormat: 'json',
    response: PendingRatingsResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/users/:username',
    alias: 'getUsersUsername',
    requestFormat: 'json',
    parameters: [
      {
        name: 'username',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: ProfileResponse,
    errors: [
      {
        status: 404,
        description: `User Not Found`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/users/:username/collaborations',
    alias: 'getUsersUsernamecollaborations',
    requestFormat: 'json',
    parameters: [
      {
        name: 'username',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'lat',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'lng',
        type: 'Query',
        schema: z.number().optional(),
      },
    ],
    response: CollaborationFeedResponse,
    errors: [
      {
        status: 404,
        description: `User Not Found`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/users/check-username',
    alias: 'getUserscheckUsername',
    requestFormat: 'json',
    parameters: [
      {
        name: 'username',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
    errors: [
      {
        status: 400,
        description: `Validation Error`,
        schema: ErrorResponse,
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/users/me',
    alias: 'getUsersme',
    requestFormat: 'json',
    response: ProfileResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
  {
    method: 'patch',
    path: '/users/me',
    alias: 'patchUsersme',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UpdateProfileRequest,
      },
    ],
    response: ProfileResponse,
    errors: [
      {
        status: 400,
        description: `Validation Error`,
        schema: ErrorResponse,
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: ErrorResponse,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
