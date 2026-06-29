import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const GoogleAuthRequest = z.object({ idToken: z.string() }).passthrough();
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
  .object({ success: z.boolean(), message: z.string().optional() })
  .passthrough();
const Category = z.enum([
  'CARPOOLING',
  'EVENTS',
  'STUDY',
  'PROFESSIONAL',
  'SPORTS',
  'TRIPS',
  'OTHER',
]);
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
const CollaborationStatus = z.enum(['OPEN', 'FULL', 'COMPLETED', 'CANCELLED']);
const Location = z
  .object({
    name: z.string().min(3).max(100),
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
    rating: z.number().int().nullable(),
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
const CreateCollaborationRequest = z
  .object({
    category: Category,
    title: z.string(),
    description: z.string(),
    fromLocation: Location,
    toLocation: Location,
    scheduledAt: z.string().datetime({ offset: true }),
    maxMembers: z.number().int().gte(2),
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
    success: z.boolean(),
    collaboration: Collaboration,
    members: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          username: z.string(),
          avatarUrl: z.string().nullable(),
        })
        .partial()
        .passthrough(),
    ),
    currentMembers: z.number().int(),
    isCreator: z.boolean(),
    myJoinStatus: JoinStatus,
  })
  .partial()
  .passthrough();
const UpdateCollaborationRequest = z
  .object({
    title: z.string(),
    description: z.string(),
    scheduledAt: z.string().datetime({ offset: true }),
    maxMembers: z.number().int(),
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
  })
  .passthrough();
const ChatRoomsResponse = z
  .object({ success: z.boolean(), data: z.array(ChatRoom) })
  .partial()
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
const SendMessageRequest = z.object({ message: z.string() }).passthrough();
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
const Notification = z
  .object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    body: z.string(),
    isRead: z.boolean(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const NotificationsResponse = z
  .object({ success: z.boolean(), data: z.array(Notification) })
  .partial()
  .passthrough();

export const schemas = {
  GoogleAuthRequest,
  User,
  AuthResponse,
  ErrorResponse,
  AuthMeResponse,
  SuccessResponse,
  Category,
  OnboardingRequest,
  ProfileResponse,
  UpdateProfileRequest,
  CollaborationStatus,
  Location,
  CollaborationFeedItem,
  PaginationMeta,
  CollaborationFeedResponse,
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
  Message,
  MessagesResponse,
  SendMessageRequest,
  SubmitRatingRequest,
  Notification,
  NotificationsResponse,
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
        schema: z.object({ idToken: z.string() }).passthrough(),
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
        schema: z.object({ message: z.string() }).passthrough(),
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
    method: 'get',
    path: '/collaborations/:id/requests',
    alias: 'getCollaborationsIdrequests',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z.array(
          z
            .object({
              requestId: z.string(),
              joinMessage: z.string(),
              status: JoinStatus,
              user: User,
            })
            .partial()
            .passthrough(),
        ),
      })
      .partial()
      .passthrough(),
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
    path: '/notifications',
    alias: 'getNotifications',
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
