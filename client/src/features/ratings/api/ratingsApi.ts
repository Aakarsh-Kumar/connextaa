import { api } from "@/services/api";
import {
  PendingRatingsResponse,
  RatingQueueResponse,
  SubmitRatingRequest,
  SuccessResponse,
} from "@/types";

export const ratingsApi = {
  getPendingRatings: async (): Promise<PendingRatingsResponse> => {
    const response = await api.get<PendingRatingsResponse>("/ratings/pending");
    return response.data;
  },

  getRatingQueue: async (collaborationId: string): Promise<RatingQueueResponse> => {
    const response = await api.get<RatingQueueResponse>(`/ratings/${collaborationId}`);
    return response.data;
  },

  submitRating: async (data: SubmitRatingRequest): Promise<SuccessResponse> => {
    const response = await api.post<SuccessResponse>("/ratings", data);
    return response.data;
  },
};
