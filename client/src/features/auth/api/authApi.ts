import { api } from "@/services/api";
import { AuthResponse } from "../types";

export const authApi = {
  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google", { idToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>("/auth/logout");
    return response.data;
  },
};
