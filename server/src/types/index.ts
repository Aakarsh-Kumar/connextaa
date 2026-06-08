import { components } from './api';

export interface UserSession {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

// Structured schemas exported for convenient development use
export type UserSchema = components['schemas']['User'];
export type Category = components['schemas']['Category'];
export type CollaborationStatus = components['schemas']['CollaborationStatus'];
export type JoinStatus = components['schemas']['JoinStatus'];
export type LocationSchema = components['schemas']['Location'];
export type CollaborationSchema = components['schemas']['Collaboration'];
export type CreateCollaborationRequest = components['schemas']['CreateCollaborationRequest'];
export type JoinRequestSchema = components['schemas']['JoinRequest'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type PaginationMeta = components['schemas']['PaginationMeta'];
