import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useChat, useUnreadCount } from "@/hooks";
import { CountBadge } from "@/components/ui/CustomBadge";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { Loader2 } from "lucide-react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import LoginModal from "./LoginModal";

export default function FloatingButtons() {
  const { user, isCustomer, isAuthenticated } = useUser();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { count: unreadCount, refetch: refetchUnread } = useUnreadCount(
    isCustomer && user ? user.id : undefined
  );

  const {
    chat,
    messages,
    loading,
    sending,
    isConnected,
    initializeChat,
    sendMessage,
    connect,
    disconnect,
    markAsRead,
  } = useChat({
    userId: user?.id,
    isStaff: false,
    onMessageReceived: (message) => {
      // Only handle messages from staff
      const isFromStaff = message.isStaff;
      
      if (isFromStaff) {
        // If chat modal is open, mark as read immediately
        if (isChatOpen && message.chatId === chat?.id) {
          markAsRead(message.chatId);
        } else {
          // If chat is closed, refetch unread count to update badge
          refetchUnread();
        }
      }
    },
  });

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto connect to WebSocket and subscribe to chat when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && isCustomer) {
      // Initialize chat and subscribe
      initializeChat().then((loadedChat) => {
        if (loadedChat) {
          // Connect to WebSocket and subscribe to this chat
          connect(loadedChat.id);
        }
      });
    }

    // Cleanup on logout
    return () => {
      if (!isAuthenticated) {
        disconnect();
      }
    };
  }, [isAuthenticated, user, isCustomer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark as read when chat modal opens
  useEffect(() => {
    if (isChatOpen && chat) {
      markAsRead(chat.id);
    }
  }, [isChatOpen, chat, markAsRead]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendMessage = async (message: string): Promise<boolean> => {
    const result = await sendMessage(message);
    return result ?? false;
  };

  const handleToggleChat = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const newOpenState = !isChatOpen;
    setIsChatOpen(newOpenState);
    
    if (newOpenState && unreadCount > 0 && chat) {
      markAsRead(chat.id);
      refetchUnread();
    }
  };

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
      return "Hôm qua " + messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }) + " " + messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <>
      {/* Chat Window - Only show when authenticated and chat is open */}
      {isAuthenticated && user && isCustomer && isChatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-10rem)] sm:h-[600px] max-h-[600px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 border-2 overflow-hidden rounded-xl bg-white">
          <ChatHeader onClose={handleToggleChat} />

          <div className="flex-1 flex flex-col p-0 min-h-0 bg-white">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                </div>
              </div>
            ) : (
              <>
                <ChatMessages
                  messages={messages}
                  formatTime={formatTime}
                  scrollRef={scrollRef}
                  currentUserName={user?.fullName}
                />

                <ChatInput
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  isSending={sending}
                  showStaffWarning={!chat?.staffId && messages.length === 0}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3">
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="lg"
            className="w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}

        {/* Chat Button - Always show */}
        <Button
          onClick={handleToggleChat}
          size="lg"
          className={cn(
            "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative",
            "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          )}
        >
          {isChatOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              {isAuthenticated && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1">
                  <CountBadge count={unreadCount} max={9} variant="error" size="sm" />
                </div>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
}

