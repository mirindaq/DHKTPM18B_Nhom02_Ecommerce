import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "@/services/chat.service";
import { webSocketService } from "@/services/websocket.service";
import { toast } from "sonner";
import type { Chat, Message, MessageType } from "@/types/chat.type";

interface UseChatOptions {
  userId?: number;
  isStaff?: boolean;
  onMessageReceived?: (message: Message) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { userId, isStaff = false, onMessageReceived } = options;
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const chatSubscriptionRef = useRef<any>(null);
  const lastReadChatIdRef = useRef<number | null>(null);

  const initializeChat = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      if (isStaff) {
        return;
      } else {
        try {
          const response = await chatService.getChatByCustomerId(userId);
          setChat(response.data);
          setMessages(response.data.messages || []);
          setUnreadCount(response.data.unreadCount || 0);
          return response.data;
        } catch (error: any) {
          if (error.status === 404 || error.message?.includes('not found')) {
            const createResponse = await chatService.createChat({
              customerId: userId,
            });
            setChat(createResponse.data);
            setMessages([]);
            setUnreadCount(0);
            return createResponse.data;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Không thể tải chat");
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, isStaff]);

  const loadChat = useCallback(async (chatId: number) => {
    try {
      const response = await chatService.getMessagesByChatId(chatId);
      setMessages(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Không thể tải tin nhắn");
      return [];
    }
  }, []);

  const markAsRead = useCallback(async (chatId: number) => {
    if (lastReadChatIdRef.current === chatId) return;

    try {
      if (isStaff) {
        await chatService.markMessagesAsReadByStaff(chatId);
      } else {
        await chatService.markMessagesAsReadByCustomer(chatId);
      }
      lastReadChatIdRef.current = chatId;
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [isStaff]);

  const sendMessage = useCallback(async (
    content: string, 
    messageType: MessageType = "TEXT",
    chatId?: number
  ) => {
    const targetChatId = chatId || chat?.id;
    if (!targetChatId || !userId || !content.trim()) return;

    try {
      setSending(true);
      
      const messageRequest = {
        chatId: targetChatId,
        content: content.trim(),
        messageType: messageType,
        senderId: userId,
        isStaff,
      };

      if (isConnected) {
        webSocketService.sendMessage(messageRequest);
      }
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn");
      return false;
    } finally {
      setSending(false);
    }
  }, [chat?.id, userId, isStaff, isConnected]);

  const connect = useCallback((chatId?: number) => {
    const handleMessageReceived = (message: Message) => {
      const targetChatId = chatId || chat?.id;
      
      if (message.chatId === targetChatId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
      
      onMessageReceived?.(message);
    };

    webSocketService.connect(
      () => {
        console.log('User WebSocket connected, subscribing to chat...');
        
        const targetChatId = chatId || chat?.id;
        if (targetChatId) {
          if (chatSubscriptionRef.current) {
            chatSubscriptionRef.current.unsubscribe();
          }
          chatSubscriptionRef.current = webSocketService.subscribeToChatRoom(
            targetChatId,
            handleMessageReceived
          );
        }

        setIsConnected(true);
      },
      (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      }
    );
  }, [chat?.id, onMessageReceived]);

  const disconnect = useCallback(() => {
    if (chatSubscriptionRef.current) {
      chatSubscriptionRef.current.unsubscribe();
      chatSubscriptionRef.current = null;
    }
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);

  const assignStaff = useCallback(async (chatId: number, staffId: number) => {
    try {
      await chatService.assignStaffToChat(chatId, staffId);
      return true;
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast.error("Không thể nhận chat");
      return false;
    }
  }, []);

  const transferChat = useCallback(async (chatId: number, staffId: number) => {
    try {
      const response = await chatService.assignStaffToChat(chatId, staffId);
      return response.data;
    } catch (error) {
      console.error("Error transferring chat:", error);
      toast.error("Không thể chuyển chat");
      throw error;
    }
  }, []);

  const unassignChat = useCallback(async (chatId: number) => {
    try {
      const response = await chatService.unassignStaffFromChat(chatId);
      return response.data;
    } catch (error) {
      console.error("Error unassigning chat:", error);
      toast.error("Không thể trả lại chat");
      throw error;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    chat,
    setChat,
    messages,
    setMessages,
    loading,
    sending,
    isConnected,
    unreadCount,
    setUnreadCount,
    initializeChat,
    loadChat,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
    assignStaff,
    transferChat,
    unassignChat,
  };
}

export function useUnreadCount(userId?: number) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await chatService.getChatByCustomerId(userId);
      setCount(response.data?.unreadCount || 0);
    } catch (error) {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return { count, loading, refetch: fetchUnreadCount };
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllChats();
      setChats(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("Không thể tải danh sách chat");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return { chats, setChats, loading, refetch: fetchChats };
}

