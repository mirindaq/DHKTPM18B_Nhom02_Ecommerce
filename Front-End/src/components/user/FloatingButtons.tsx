import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, MessageCircle, X, Bot } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useChat, useUnreadCount } from "@/hooks";
import { CountBadge } from "@/components/ui/CustomBadge";
import { cn } from "@/lib/utils";
import ChatSupportModal from "./chat/ChatSupportModal";
import AIChatModal from "./chat/AIChatModal";
import LoginModal from "./LoginModal";

export default function FloatingButtons() {
  const { user, isCustomer, isAuthenticated } = useUser();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendMessage = async (message: string, messageType?: "TEXT" | "IMAGE"): Promise<boolean> => {
    const result = await sendMessage(message, messageType || "TEXT");
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
    
    // Close AI chat if it's open
    if (newOpenState && isAIChatOpen) {
      setIsAIChatOpen(false);
    }
    
    if (newOpenState && unreadCount > 0 && chat) {
      markAsRead(chat.id);
      refetchUnread();
    }
  };

  const handleToggleAIChat = () => {
    // AI Chat không cần đăng nhập
    const newOpenState = !isAIChatOpen;
    setIsAIChatOpen(newOpenState);
    
    // Close regular chat if it's open
    if (newOpenState && isChatOpen) {
      setIsChatOpen(false);
    }
  };

  return (
    <>
      {/* AI Chat Modal - Không cần đăng nhập */}
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Chat Support Modal */}
      {isAuthenticated && user && isCustomer && (
        <ChatSupportModal
          isOpen={isChatOpen}
          onClose={handleToggleChat}
          chat={chat}
          messages={messages}
          loading={loading}
          sending={sending}
          isConnected={isConnected}
          currentUserName={user?.fullName}
          onSendMessage={handleSendMessage}
        />
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

        {/* AI Chat Button */}
        <Button
          onClick={handleToggleAIChat}
          size="lg"
          className={cn(
            "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative",
            "bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
          )}
          title="Trợ lý AI"
        >
          {isAIChatOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </Button>

        {/* Chat Support Button - Always show */}
        <Button
          onClick={handleToggleChat}
          size="lg"
          className={cn(
            "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative",
            "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          )}
          title="Chat hỗ trợ"
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

