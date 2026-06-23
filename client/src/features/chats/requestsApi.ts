import { api } from "@/services/api";
import {
  PendingJoinRequestsResponse
} from "@/types";

export const requestsApi = {
  getRequests: async (): Promise<PendingJoinRequestsResponse> => {
    const response = await api.get<PendingJoinRequestsResponse>("/collaborations/requests");
    return response.data;
  },
  approveRequest: async (requestId: string) => {
    const response = await api.post(`/collaborations/requests/${requestId}/approve`);
    return response.data;
  },
  rejectRequest: async (requestId: string) => {
    const response = await api.post(`/collaborations/requests/${requestId}/reject`);
    return response.data;
  },
};
