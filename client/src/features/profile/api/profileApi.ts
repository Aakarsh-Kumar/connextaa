import { api } from "@/services/api";
import { ProfileResponse, UpdateProfileRequest, CollaborationFeedResponse } from "@/types";

export const profileApi = {
  getMeProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>("/users/me");
    return response.data;
  },

  updateMeProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await api.patch<ProfileResponse>("/users/me", data);
    return response.data;
  },

  getPublicProfile: async (userId: string): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>(`/users/${userId}`);
    return response.data;
  },

  getUserCollaborations: async (
    username: string,
    cursor?: string,
    lat?: number,
    lng?: number
  ): Promise<CollaborationFeedResponse & { nextCursor?: string | null }> => {
    const response = await api.get(`/users/${username}/collaborations`, {
      params: {
        ...(cursor ? { cursor } : {}),
        ...(lat !== undefined ? { lat } : {}),
        ...(lng !== undefined ? { lng } : {}),
      },
    });
    return response.data;
  },
};
