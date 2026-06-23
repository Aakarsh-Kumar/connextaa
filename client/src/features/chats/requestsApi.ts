import { api } from "@/services/api";
import {
  PendingJoinRequestsResponse
} from "@/types";

export const requestsApi = {
  getRequests: async (): Promise<PendingJoinRequestsResponse> => {
    const response = await api.get<PendingJoinRequestsResponse>("/collaborations/requests");
    return response.data;
  },
};
