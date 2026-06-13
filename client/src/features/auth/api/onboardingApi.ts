import { api } from "@/services/api";

export const onboardingApi = {
  completeOnboarding: async (onboardingData: {
    username: string;
    bio?: string;
    categories: string[];
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post("/onboarding", onboardingData);
    return response.data;
  },
};
