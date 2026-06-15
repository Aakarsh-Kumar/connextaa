import { api } from "@/services/api";
import { ProfileResponse, UpdateProfileRequest } from "@/types";

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
};
