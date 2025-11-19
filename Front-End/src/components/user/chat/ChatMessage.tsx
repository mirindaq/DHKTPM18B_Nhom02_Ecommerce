import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  senderName: string;
  isStaff: boolean;
  createdAt: string;
}

interface ChatMessageProps {
  message: Message;
  showAvatar: boolean;
  formatTime: (date: string) => string;
  currentUserName?: string;
}

export default function ChatMessage({ 
  message, 
  showAvatar, 
  formatTime,
  currentUserName 
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-2 items-end",
        message.isStaff ? "justify-start" : "justify-end"
      )}
    >
      {message.isStaff && (
        <Avatar className={cn(
          "h-8 w-8 flex-shrink-0",
          !showAvatar && "invisible"
        )}>
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[80%] min-w-0",
        message.isStaff ? "items-start" : "items-end"
      )}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm break-words",
            message.isStaff
              ? "bg-white border border-gray-200 text-foreground rounded-bl-md"
              : "bg-primary text-primary-foreground rounded-br-md"
          )}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          {formatTime(message.createdAt)}
        </p>
      </div>

      {!message.isStaff && (
        <Avatar className={cn(
          "h-8 w-8 flex-shrink-0",
          !showAvatar && "invisible"
        )}>
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {currentUserName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

