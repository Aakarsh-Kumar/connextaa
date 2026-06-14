import { api } from "@/services/api";
import { OnboardingRequest, SuccessResponse } from "@/types";

export const onboardingApi = {
  completeOnboarding: async (onboardingData: OnboardingRequest): Promise<SuccessResponse> => {
    const response = await api.post("/onboarding", onboardingData);
    return response.data;
  },
};