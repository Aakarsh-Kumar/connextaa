import { api } from "@/services/api";
import {
  ChatRoomsResponse,
  MessagesResponse,
  Message,
  SendMessageRequest,
} from "@/types";

export const chatApi = {
  getChatRooms: async (): Promise<ChatRoomsResponse> => {
    const response = await api.get<ChatRoomsResponse>("/chat/rooms");
    return response.data;
  },

  getRoomMessages: async (
    roomId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<MessagesResponse> => {
    const response = await api.get<MessagesResponse>(
      `/chat/rooms/${roomId}/messages`,
      { params }
    );
    return response.data;
  },

  sendMessage: async (
    roomId: string,
    messageData: SendMessageRequest
  ): Promise<Message> => {
    const response = await api.post<Message>(
      `/chat/rooms/${roomId}/messages`,
      messageData
    );
    return response.data;
  },
};
