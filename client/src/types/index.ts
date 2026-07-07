import { components } from "./api";

export type User = components["schemas"]["User"];
export type Category = components["schemas"]["Category"];
export type AuthResponse = components["schemas"]["AuthResponse"];
export type SuccessResponse = components["schemas"]["SuccessResponse"];
export type OnboardingRequest = components["schemas"]["OnboardingRequest"];
export type AuthMeResponse = components["schemas"]["AuthMeResponse"];
export type CreateCollaborationRequest = components["schemas"]["CreateCollaborationRequest"];
export type CreateCollaborationResponse = components["schemas"]["CreateCollaborationResponse"];
export type ProfileResponse = components["schemas"]["ProfileResponse"];
export type UpdateProfileRequest = components["schemas"]["UpdateProfileRequest"];
export type CollaborationFeedItem = components["schemas"]["CollaborationFeedItem"];
export type CollaborationFeedResponse = components["schemas"]["CollaborationFeedResponse"];
export type CollaborationStatus = components["schemas"]["CollaborationStatus"];
export type JoinStatus = components["schemas"]["JoinStatus"];
export type PendingJoinRequestsResponse = components["schemas"]["PendingJoinRequestsResponse"];

export type ChatRoom = components["schemas"]["ChatRoom"];
export type ChatRoomsResponse = components["schemas"]["ChatRoomsResponse"];
export type Message = components["schemas"]["Message"];
export type SendMessageRequest = components["schemas"]["SendMessageRequest"];
export type MessagesResponse = components["schemas"]["MessagesResponse"];

export type CollaborationResponse = components["schemas"]["CollaborationResponse"]
export type Notification = components["schemas"]["Notification"]
export type NotificationsResponse = components["schemas"]["NotificationsResponse"]
export type NotificationType = components["schemas"]["NotificationType"]
