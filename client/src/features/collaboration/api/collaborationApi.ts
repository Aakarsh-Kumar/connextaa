import { api } from "@/services/api";
import {
  CreateCollaborationRequest,
  CreateCollaborationResponse,
  CollaborationFeedResponse,
  Category,
  SuccessResponse,
  CollaborationResponse
} from "@/types";

export const collaborationApi = {
  createCollaboration: async (
    collaborationData: CreateCollaborationRequest
  ): Promise<CreateCollaborationResponse> => {
    const response = await api.post("/collaborations", collaborationData);
    console.log("api", response.data);
    return response.data;
  },

  getCollaborations: async (params: {
    page?: number;
    limit?: number;
    category?: Category;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<CollaborationFeedResponse> => {
    const response = await api.get<CollaborationFeedResponse>("/collaborations", {
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

  getCollaborationDetails: async (id: string): Promise<CollaborationResponse> => {
    const response = await api.get<CollaborationResponse>(`/collaborations/${id}`);
    return response.data;
  },
};