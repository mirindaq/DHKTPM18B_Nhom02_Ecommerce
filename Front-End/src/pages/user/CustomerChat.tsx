import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { chatService } from "@/services/chat.service";
import { webSocketService } from "@/services/websocket.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Chat, Message, MessageType } from "@/types/chat.type";
import { cn } from "@/lib/utils";

export default function CustomerChat() {
  const { user } = useUser();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const initChat = async () => {
      try {
        setLoading(true);
        
        // Lấy hoặc tạo chat
        try {
          const response = await chatService.getChatByCustomerId(user.id);
          setChat(response.data);
          setMessages(response.data.messages || []);
        } catch (error: any) {
          // Nếu chưa có chat, tạo mới
          if (error.status === 404 || error.message?.includes('not found')) {
            const createResponse = await chatService.createChat({
              customerId: user.id,
            });
            setChat(createResponse.data);
            setMessages([]);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Không thể tải chat");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [user]);

  // WebSocket connection
  useEffect(() => {
    if (!chat) return;

    const handleMessageReceived = (message: Message) => {
      if (message.chatId === chat.id) {
        setMessages((prev) => {
          // Tránh trùng lặp message
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        
        // Đánh dấu đã đọc nếu là tin nhắn từ staff
        if (message.isStaff) {
          chatService.markMessagesAsRead(chat.id).catch(console.error);
        }
      }
    };

    // Connect to WebSocket
    webSocketService.connect(handleMessageReceived, (error) => {
      console.error("WebSocket error:", error);
      toast.error("Mất kết nối chat");
      setIsConnected(false);
    });

    // Subscribe to specific chat room
    const subscription = webSocketService.subscribeToChatRoom(chat.id, handleMessageReceived);
    chatSubscriptionRef.current = subscription;
    setIsConnected(true);

    return () => {
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
      }
      webSocketService.disconnect();
      setIsConnected(false);
    };
  }, [chat]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chat || !user) return;

    try {
      setSending(true);
      
      const messageRequest = {
        chatId: chat.id,
        content: newMessage.trim(),
        messageType: "TEXT" as MessageType,
        senderId: user.id,
        isStaff: false,
      };

      // Gửi qua WebSocket
      if (isConnected) {
        webSocketService.sendMessage(messageRequest);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập để sử dụng chat.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat với chúng tôi
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="bg-green-500">
                  Đã kết nối
                </Badge>
              ) : (
                <Badge variant="destructive">Mất kết nối</Badge>
              )}
            </div>
          </div>
          {chat?.staffName && (
            <p className="text-sm text-muted-foreground">
              Đang chat với: <span className="font-medium">{chat.staffName}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có tin nhắn nào</p>
                  <p className="text-sm mt-1">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.isStaff ? "justify-start" : "justify-end"
                    )}
                  >
                    {message.isStaff && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {message.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[70%] space-y-1",
                        message.isStaff ? "items-start" : "items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2",
                          message.isStaff
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {message.isStaff && (
                          <p className="text-xs font-medium mb-1">
                            {message.senderName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground px-1">
                        {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {!message.isStaff && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            {!chat?.staffId && messages.length === 0 && (
              <Alert className="mb-3">
                <AlertDescription className="text-sm">
                  Tin nhắn của bạn sẽ được nhân viên hỗ trợ sớm nhất có thể.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={sending || !isConnected}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={sending || !isConnected || !newMessage.trim()}
                size="icon"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

