import type { ResponseApi } from "./responseApi.type";

export const MessageType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE"
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export type Message = {
  id: number;
  content: string;
  messageType: MessageType;
  status: boolean; // true: đã đọc, false: chưa đọc
  chatId: number;
  senderName: string;
  senderId: number;
  isStaff: boolean;
  createdAt: string;
};

export type Chat = {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  staffId?: number;
  staffName?: string;
  staffEmail?: string;
  unreadCount: number;
  lastMessage?: Message;
  messages: Message[];
  createdAt: string;
  modifiedAt: string;
};

export type ChatRequest = {
  customerId: number;
  staffId?: number;
};

export type MessageRequest = {
  chatId: number;
  content: string;
  messageType: MessageType;
  senderId: number;
  isStaff: boolean;
};

export type ChatResponse = ResponseApi<Chat>;
export type ChatListResponse = ResponseApi<Chat[]>;
export type MessageResponse = ResponseApi<Message>;
export type MessageListResponse = ResponseApi<Message[]>;
export type UnreadCountResponse = ResponseApi<number>;

