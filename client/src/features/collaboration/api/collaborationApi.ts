import { api } from "@/services/api";
import {
  CreateCollaborationRequest,
  CreateCollaborationResponse,
  CollaborationFeedResponse,
  Category,
  SuccessResponse,
  CollaborationResponse,
  CollaborationStatus
} from "@/types";

export const collaborationApi = {
  createCollaboration: async (
    collaborationData: CreateCollaborationRequest
  ): Promise<CreateCollaborationResponse> => {
    const response = await api.post("/collaborations", collaborationData);
    return response.data;
  },

  getCollaborations: async (params: {
    cursor?: string;
    limit?: number;
    category?: Category;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<CollaborationFeedResponse & { nextCursor?: string | null }> => {
    const response = await api.get<CollaborationFeedResponse & { nextCursor?: string | null }>("/collaborations", {
      params,
    });
    return response.data;
  },

  joinCollaboration: async (
    id: string,
    joinData?: { message?: string }
  ): Promise<SuccessResponse> => {
    const response = await api.post<SuccessResponse>(
      `/collaborations/${id}/join`,
      joinData
    );
    return response.data;
  },

  leaveCollaboration: async (
    id: string,
  ): Promise<SuccessResponse> => {
    const response = await api.post<SuccessResponse>(
      `/collaborations/${id}/leave`
    );
    return response.data;
  },

  removeFromCollaboration: async(id:string, memberId:string): Promise<SuccessResponse>=>{
    const response = await api.delete<SuccessResponse>(
      `/collaborations/${id}/member/${memberId}`
    );
    return response.data;
  },

  getCollaborationDetails: async (id: string): Promise<CollaborationResponse> => {
    const response = await api.get<CollaborationResponse>(`/collaborations/${id}`);
    return response.data;
  },

  updateCollaboration: async (
    id: string,
    updateData: {
      title?: string;
      description?: string;
      scheduledAt?: string;
      maxMembers?: number;
      status?: CollaborationStatus;
    }
  ): Promise<CollaborationResponse> => {
    const response = await api.patch<CollaborationResponse>(
      `/collaborations/${id}`,
      updateData
    );
    return response.data;
  },

  completeCollaboration: async (id: string): Promise<CollaborationResponse> => {
    const response = await api.patch<CollaborationResponse>(
      `/collaborations/${id}/complete`
    );
    return response.data;
  },

  deleteCollaboration: async (id: string): Promise<SuccessResponse> => {
    const response = await api.delete<SuccessResponse>(`/collaborations/${id}`);
    return response.data;
  },
};