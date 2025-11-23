import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import type { Chat, Message } from "@/types/chat.type";

interface ChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  isConnected: boolean;
  currentUserName?: string;
  onSendMessage: (message: string, messageType?: "TEXT" | "IMAGE") => Promise<boolean>;
}

export default function ChatSupportModal({
  isOpen,
  onClose,
  chat,
  messages,
  loading,
  sending,
  isConnected,
  currentUserName,
  onSendMessage,
}: ChatSupportModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [messages]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-7 right-4 sm:right-24 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-10rem)] sm:h-[600px] max-h-[600px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 border-2 rounded-xl bg-white">
      <ChatHeader onClose={onClose} />

      <div className="flex-1 flex flex-col p-0 min-h-0 bg-white overflow-hidden">
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
              currentUserName={currentUserName}
            />

            <ChatInput
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              isSending={sending}
              showStaffWarning={!chat?.staffId && messages.length === 0}
            />
          </>
        )}
      </div>
    </div>
  );
}

