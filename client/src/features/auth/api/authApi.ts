import { api } from "@/services/api";
import { AuthResponse,SuccessResponse } from "@/types";

export const authApi = {
  googleLogin: async (idToken: string): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>("/auth/google", { idToken });
      return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
      const response = await api.get<AuthResponse>("/auth/me");
      return response.data;
  },

  checkUsername: async (username: string) => {
    const response = await api.get<SuccessResponse>("/users/check-username", {
      params: { username },
    });

    return response.data;
  },

  logout: async (): Promise<SuccessResponse> => {
    const response = await api.post<SuccessResponse>("/auth/logout");
    return response.data;
  },
};