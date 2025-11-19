import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface Message {
  id: number;
  content: string;
  senderName: string;
  isStaff: boolean;
  createdAt: string;
}

interface ChatMessagesProps {
  messages: Message[];
  formatTime: (date: string) => string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  currentUserName?: string;
}

export default function ChatMessages({ 
  messages, 
  formatTime, 
  scrollRef,
  currentUserName 
}: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 sm:py-16 px-4">
            <MessageCircle className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium mb-1">Chưa có tin nhắn</p>
            <p className="text-xs">Gửi tin nhắn để bắt đầu trò chuyện</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].isStaff !== message.isStaff;
            return (
              <ChatMessage
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                formatTime={formatTime}
                currentUserName={currentUserName}
              />
            );
          })
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}

