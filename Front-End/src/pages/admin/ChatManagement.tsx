import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useChat, useChats } from "@/hooks";
import { webSocketService } from "@/services/websocket.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Loader2, 
  Users,
  UserCheck,
  Clock,
  Search,
  MessageCircleMore
} from "lucide-react";
import { toast } from "sonner";
import type { Chat } from "@/types/chat.type";
import { cn } from "@/lib/utils";
import { CustomBadge, CountBadge, StatusBadge } from "@/components/ui/CustomBadge";
import ChatInput from "@/components/user/chat/ChatInput";

export default function ChatManagement() {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unassigned" | "mine">("all");
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Chat | null>(null);
  const hasSubscribedRef = useRef(false);

  const { chats, setChats, loading: chatsLoading, refetch: refetchChats } = useChats();

  const {
    messages,
    sending,
    loadChat,
    sendMessage,
    markAsRead,
    assignStaff,
    connect,
  } = useChat({
    userId: user?.id,
    isStaff: true,
    onMessageReceived: (message) => {
      setChats((prevChats) => 
        prevChats.map((chat) => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              unreadCount: 0,
            };
          }
          return chat;
        })
      );
    },
  });

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isWebSocketConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    console.log('ChatManagement useEffect check:', { 
      chatsLength: chats.length, 
      hasUser: !!user, 
      hasSubscribed: hasSubscribedRef.current,
      isConnected: webSocketService.isWebSocketConnected()
    });

    if (chats.length === 0 || !user || hasSubscribedRef.current) return;

    if (!webSocketService.isWebSocketConnected()) {
      console.log('ChatManagement: Waiting for WebSocket connection...');
      const checkInterval = setInterval(() => {
        if (webSocketService.isWebSocketConnected()) {
          clearInterval(checkInterval);
          console.log('ChatManagement: WebSocket connected, now subscribing...');
          subscribeToAllChats();
        }
      }, 500);
      
      return () => clearInterval(checkInterval);
    }

    subscribeToAllChats();

    function subscribeToAllChats() {
      if (hasSubscribedRef.current) return;

      console.log('ChatManagement: Subscribing to all chats for realtime updates...');
      const chatIds = chats.map(chat => chat.id);
      
      webSocketService.subscribeToMultipleChats(chatIds, (message) => {
        console.log('ChatManagement useEffect: Message received for chat', message.chatId, 'from:', message.isStaff ? 'STAFF' : 'CUSTOMER');
        
        const isCurrentlyViewing = selectedChatRef.current?.id === message.chatId;
        const isFromCustomer = !message.isStaff;
        
        console.log('Update chat list:', { chatId: message.chatId, isCurrentlyViewing, isFromCustomer });
        
        setChats((prevChats) => {
          console.log('Previous chats:', prevChats.map(c => ({ id: c.id, lastMsg: c.lastMessage?.content })));
          
          const updated = prevChats.map((chat) => {
            if (chat.id === message.chatId) {
              const newUnreadCount = isCurrentlyViewing || !isFromCustomer
                ? 0
                : (chat.unreadCount || 0) + 1;
              
              console.log('Updating chat:', { id: chat.id, newUnreadCount, newMessage: message.content });
              
              return {
                ...chat,
                lastMessage: message,
                unreadCount: newUnreadCount,
              };
            }
            return chat;
          });
          
          console.log('Updated chats:', updated.map(c => ({ id: c.id, lastMsg: c.lastMessage?.content })));
          return updated;
        });
      });

      hasSubscribedRef.current = true;
      console.log('ChatManagement: Subscribed to chat IDs:', chatIds);
    }
  }, [chats, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [messages, selectedChat?.id]);

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    await loadChat(chat.id);
    await markAsRead(chat.id);
    
    setChats((prevChats) =>
      prevChats.map((c) =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );

    connect(chat.id);
  };

  const handleAssignToMe = async (chatId: number) => {
    if (!user) return;

    const success = await assignStaff(chatId, user.id);
    if (success) {
      await refetchChats();
      toast.success("Đã nhận chat thành công");
      
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, staffId: user.id, staffName: user.fullName } : null);
      }
    }
  };

  const handleSendMessage = async (message: string, messageType?: "TEXT" | "IMAGE"): Promise<boolean> => {
    if (!message.trim() || !selectedChat) return false;

    const success = await sendMessage(message, messageType || "TEXT", selectedChat.id);
    return success ?? false;
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "unassigned") {
      return matchesSearch && !chat.staffId;
    } else if (filterType === "mine") {
      return matchesSearch && chat.staffId === user?.id;
    }
    return matchesSearch;
  });

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday) {
      return "Hôm qua";
    } else {
      return messageDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Statistics
  const stats = {
    total: chats.length,
    unassigned: chats.filter(c => !c.staffId).length,
    mine: chats.filter(c => c.staffId === user?.id).length,
    unread: chats.filter(c => c.unreadCount > 0).length,
  };

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Chat
          </h1>
          <p className="text-lg text-gray-600">
            Hỗ trợ khách hàng qua chat trực tuyến
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={isConnected ? "online" : "offline"} size="md" />
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <MessageCircleMore className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{stats.total}</span>
            </div>
            {stats.unassigned > 0 && (
              <>
                <span className="text-muted-foreground">|</span>
                <CustomBadge variant="warning" size="sm">
                  <Clock className="h-3 w-3" />
                  {stats.unassigned} chờ
                </CustomBadge>
              </>
            )}
            {stats.unread > 0 && (
              <>
                <span className="text-muted-foreground">|</span>
                <CustomBadge variant="error" size="sm">
                  {stats.unread} chưa đọc
                </CustomBadge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-12 gap-4">
        {/* Chat List */}
        <Card className="col-span-4 flex flex-col h-[calc(100vh-180px)]">
          <CardHeader className="border-b p-3 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Danh sách chat
              </CardTitle>
              <CustomBadge variant="default" size="sm">
                {filteredChats.length} chat
              </CustomBadge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, email khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-muted rounded-lg">
              <Button
                variant={filterType === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="flex-1 h-8 text-xs"
              >
                Tất cả ({stats.total})
              </Button>
              <Button
                variant={filterType === "unassigned" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("unassigned")}
                className="flex-1 h-8 text-xs"
              >
                Chờ ({stats.unassigned})
              </Button>
              <Button
                variant={filterType === "mine" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("mine")}
                className="flex-1 h-8 text-xs"
              >
                Của tôi ({stats.mine})
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {filteredChats.length === 0 ? (
                <div className="text-center text-muted-foreground py-16 px-4">
                  <MessageSquare className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Không có chat nào</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có khách hàng nào chat"}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-muted/50 transition-all border-b border-border/50 last:border-0",
                        selectedChat?.id === chat.id && "bg-primary/5 border-l-4 border-l-primary pl-2.5"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-10 w-10 ring-2 ring-background">
                            <AvatarFallback className={cn(
                              "text-xs font-bold",
                              chat.unreadCount > 0 
                                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            )}>
                              {chat.customerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {chat.unreadCount > 0 && (
                            <div className="absolute -top-0.5 -right-0.5">
                              <CountBadge count={chat.unreadCount} size="sm" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <h3 className={cn(
                              "text-sm font-medium truncate",
                              chat.unreadCount > 0 && "font-bold text-foreground"
                            )}>
                              {chat.customerName}
                            </h3>
                            {chat.lastMessage && (
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          
                          <p className={cn(
                            "text-xs truncate mb-2 leading-relaxed",
                            chat.unreadCount > 0 
                              ? "text-foreground font-medium" 
                              : "text-muted-foreground"
                          )}>
                            {chat.lastMessage?.messageType === "IMAGE" 
                              ? "📷 Hình ảnh" 
                              : chat.lastMessage?.content || "Chưa có tin nhắn"}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {chat.staffId ? (
                              <CustomBadge variant="success" size="sm">
                                <UserCheck className="h-2.5 w-2.5" />
                                {chat.staffId === user?.id ? "Bạn" : chat.staffName}
                              </CustomBadge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignToMe(chat.id);
                                }}
                              >
                                <Clock className="h-2.5 w-2.5 mr-1" />
                                Nhận chat
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-8 flex flex-col h-[calc(100vh-180px)]">
          {selectedChat ? (
            <>
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                        {selectedChat.customerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {selectedChat.customerName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedChat.customerEmail}
                      </p>
                    </div>
                  </div>
                  
                  {selectedChat.staffId ? (
                    <CustomBadge variant="success" size="sm">
                      <UserCheck className="h-3 w-3" />
                      {selectedChat.staffId === user?.id ? "Bạn đang xử lý" : selectedChat.staffName}
                    </CustomBadge>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7"
                      onClick={() => handleAssignToMe(selectedChat.id)}
                    >
                      <Clock className="h-3 w-3 mr-1.5" />
                      Nhận chat
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col min-h-0 p-0 bg-gradient-to-b from-muted/10 to-background">
                {/* Messages Area */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-2.5 p-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-16">
                        <MessageSquare className="h-14 w-14 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">Chưa có tin nhắn</p>
                        <p className="text-xs mt-1">Bắt đầu cuộc trò chuyện</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const showAvatar = index === 0 || messages[index - 1].isStaff !== message.isStaff;
                        
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-2 items-end",
                              message.isStaff ? "justify-end" : "justify-start"
                            )}
                          >
                            {!message.isStaff && (
                              <Avatar className={cn(
                                "h-6 w-6 flex-shrink-0",
                                !showAvatar && "invisible"
                              )}>
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                  {message.senderName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={cn(
                              "flex flex-col max-w-[70%]",
                              message.isStaff ? "items-end" : "items-start"
                            )}>
                              {message.messageType === "IMAGE" ? (
                                <div className="flex flex-col gap-1">
                                  <div className="rounded-xl overflow-hidden shadow-md border-2 border-white">
                                    <img 
                                      src={message.content} 
                                      alt="Shared image" 
                                      className="max-w-[250px] max-h-[250px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(message.content, '_blank')}
                                    />
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                    {formatTime(message.createdAt)}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div
                                    className={cn(
                                      "rounded-2xl px-3 py-2 shadow-sm",
                                      message.isStaff
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-white border border-gray-200 text-foreground rounded-bl-md"
                                    )}
                                  >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                    {formatTime(message.createdAt)}
                                  </p>
                                </>
                              )}
                            </div>

                            {message.isStaff && (
                              <Avatar className={cn(
                                "h-6 w-6 flex-shrink-0",
                                !showAvatar && "invisible"
                              )}>
                                <AvatarFallback className="bg-blue-600 text-white text-[10px]">
                                  {message.senderName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input Area - Fixed at bottom */}
                <div className="flex-shrink-0">
                  {!selectedChat.staffId ? (
                    <div className="border-t bg-white p-2.5">
                      <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 font-medium mb-2">
                          ⚠️ Cần nhận chat trước khi gửi tin nhắn
                        </p>
                        <Button
                          size="sm"
                          className="h-7"
                          onClick={() => handleAssignToMe(selectedChat.id)}
                        >
                          <Clock className="h-3 w-3 mr-1.5" />
                          Nhận chat ngay
                        </Button>
                      </div>
                    </div>
                  ) : selectedChat.staffId !== user?.id ? (
                    <div className="border-t bg-white p-2.5">
                      <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600">
                          Chat đang được xử lý bởi <strong>{selectedChat.staffName}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      isConnected={isConnected}
                      isSending={sending}
                      showStaffWarning={false}
                    />
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted/10 to-background">
              <div className="text-center">
                <MessageSquare className="h-20 w-20 mx-auto mb-4 opacity-15" />
                <p className="text-lg font-semibold mb-1">Chọn cuộc trò chuyện</p>
                <p className="text-sm">Chọn chat để bắt đầu hỗ trợ khách hàng</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
