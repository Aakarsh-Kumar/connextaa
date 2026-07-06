import { api } from "@/services/api";
import { NotificationsResponse, SuccessResponse } from "@/types";

export const notificationsApi = {
  /**
   * Fetch notifications with cursor-based pagination.
   * @param cursor - The cursor for the next page (id of last item from previous page)
   * @param limit  - Number of notifications per page (default 20)
   */
  getNotifications: async (params?: {
    cursor?: string;
    limit?: number;
  }): Promise<NotificationsResponse> => {
    // const response = await api.get<NotificationsResponse>("/notifications", {
    //   params: {
    //     ...(params?.cursor ? { cursor: params.cursor } : {}),
    //     limit: params?.limit ?? 20,
    //   },
    // });
    // return response.data;
    return {
      "success": true,
      'data': [
    {
      "id": "<uuid>",
      "type": "JOIN_REQUEST",
      "title": "<string>",
      "body": "<string>",
      "referenceId": "<string>",
      "isRead": true,
      "createdAt": "<dateTime>"
    },
    {
      "id": "<uuid>",
      "type": "NEW_MESSAGE",
      "title": "<string>",
      "body": "<string>",
      "referenceId": "<string>",
      "isRead": false,
      "createdAt": "<dateTime>"
    }
  ],
  "nextCursor": "<string>"
}
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id: string): Promise<SuccessResponse> => {
    const response = await api.patch<SuccessResponse>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async (): Promise<SuccessResponse> => {
    const response = await api.patch<SuccessResponse>("/notifications/read-all");
    return response.data;
  },
};
