import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';
import type {
  ChatRequest,
  ChatResponse,
  ChatListResponse,
  MessageListResponse,
  UnreadCountResponse,
} from '@/types/chat.type';

export const chatService = {
  // Chat Management
  createChat: async (request: ChatRequest) => {
    const response = await axiosClient.post<ChatResponse>('/chats', request);
    return response.data;
  },

  getChatById: async (chatId: number) => {
    const response = await axiosClient.get<ChatResponse>(`/chats/${chatId}`);
    return response.data;
  },

  getChatByCustomerId: async (customerId: number) => {
    const response = await axiosClient.get<ChatResponse>(`/chats/customer/${customerId}`);
    return response.data;
  },

  getChatsByStaffId: async (staffId: number) => {
    const response = await axiosClient.get<ChatListResponse>(`/chats/staff/${staffId}`);
    return response.data;
  },

  getAllChats: async () => {
    const response = await axiosClient.get<ChatListResponse>('/chats');
    return response.data;
  },

  getUnassignedChats: async () => {
    const response = await axiosClient.get<ChatListResponse>('/chats/unassigned');
    return response.data;
  },

  assignStaffToChat: async (chatId: number, staffId: number) => {
    const response = await axiosClient.put<ChatResponse>(`/chats/${chatId}/assign/${staffId}`);
    return response.data;
  },

  // Message Management
  getMessagesByChatId: async (chatId: number) => {
    const response = await axiosClient.get<MessageListResponse>(`/chats/${chatId}/messages`);
    return response.data;
  },

  markMessagesAsRead: async (chatId: number) => {
    const response = await axiosClient.put<ResponseApi<void>>(`/chats/${chatId}/read`);
    return response.data;
  },

  getUnreadMessageCount: async (chatId: number) => {
    const response = await axiosClient.get<UnreadCountResponse>(`/chats/${chatId}/unread-count`);
    return response.data;
  },
};

