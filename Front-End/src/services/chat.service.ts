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
    const response = await axiosClient.put<ResponseApi<void>>(`/chats/${chatId}/assign/${staffId}`);
    return response.data;
  },

  unassignStaffFromChat: async (chatId: number) => {
    const response = await axiosClient.put<ResponseApi<void>>(`/chats/${chatId}/unassign`);
    return response.data;
  },

  bulkTransferChats: async (chatIds: number[], staffId: number) => {
    const response = await axiosClient.put<ResponseApi<void>>('/chats/bulk-transfer', {
      chatIds,
      staffId,
    });
    return response.data;
  },

  bulkUnassignChats: async (chatIds: number[]) => {
    const response = await axiosClient.put<ResponseApi<void>>('/chats/bulk-unassign', {
      chatIds,
    });
    return response.data;
  },

  // Message Management
  getMessagesByChatId: async (chatId: number) => {
    const response = await axiosClient.get<MessageListResponse>(`/chats/${chatId}/messages`);
    return response.data;
  },

  markMessagesAsReadByCustomer: async (chatId: number) => {
    const response = await axiosClient.put<ResponseApi<void>>(`/chats/${chatId}/read/customer`);
    return response.data;
  },

  markMessagesAsReadByStaff: async (chatId: number) => {
    const response = await axiosClient.put<ResponseApi<void>>(`/chats/${chatId}/read/staff`);
    return response.data;
  },

  getUnreadMessageCount: async (chatId: number, userId: number) => {
    const response = await axiosClient.get<UnreadCountResponse>(`/chats/${chatId}/unread-count/${userId}`);
    return response.data;
  },
};

