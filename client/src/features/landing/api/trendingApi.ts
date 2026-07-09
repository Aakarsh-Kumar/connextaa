import { api } from "@/services/api";
import { CollaborationFeedResponse } from "@/types";

export const trendingApi = {
  getTrending: async (): Promise<CollaborationFeedResponse> => {
    const response =
      await api.get<CollaborationFeedResponse>("/landing/trending");
    return response.data;
  },
};
