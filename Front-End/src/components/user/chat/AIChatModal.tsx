import { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { aiService } from "@/services/ai.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  content: string;
  isAI: boolean;
  createdAt: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Tạo sessionId unique cho mỗi lần mở modal
  const sessionId = useMemo(() => {
    return `ai-chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      isAI: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    // Thêm message "đang suy nghĩ..." tạm thời
    const thinkingMessage: AIMessage = {
      id: "thinking",
      content: "...",
      isAI: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await aiService.chat({
        message: userMessage.content,
        customerId: user?.id || null, // null nếu chưa đăng nhập
        sessionId: sessionId, // Gửi sessionId để track conversation
      });

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.message,
        isAI: true,
        createdAt: new Date(),
      };

      // Xóa "thinking" message và thêm response thật
      setMessages((prev) => prev.filter((m) => m.id !== "thinking").concat(aiMessage));
    } catch (error) {
      console.error("Error sending message to AI:", error);
      toast.error("Không thể gửi tin nhắn đến AI");
      // Xóa thinking message khi lỗi
      setMessages((prev) => prev.filter((m) => m.id !== "thinking"));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-25 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-10rem)] sm:h-[600px] max-h-[600px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 border-2 rounded-xl bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-semibold">Trợ lý AI</h3>
            <p className="text-xs text-purple-100">Sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="hover:bg-purple-700 text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="bg-purple-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
            <p className="font-medium text-gray-700">Xin chào! Tôi là trợ lý AI</p>
            <p className="text-sm mt-2">Hãy đặt câu hỏi về:</p>
            <div className="text-sm mt-2 space-y-1">
              <p>• Tư vấn sản phẩm phù hợp</p>
              <p>• Trạng thái đơn hàng</p>
              <p>• Hướng dẫn sử dụng, bảo hành</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.isAI ? "justify-start" : "justify-end"
              )}
            >
              {msg.isAI && (
                <Avatar className="h-8 w-8 border-2 border-purple-200">
                  <AvatarFallback className="bg-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={cn("max-w-[75%] space-y-1")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5",
                    msg.isAI
                      ? "bg-white border border-purple-200 text-gray-800 shadow-sm"
                      : "bg-purple-600 text-white"
                  )}
                >
                  {msg.isAI && (
                    <p className="text-xs font-medium mb-1 text-purple-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Trợ lý AI
                      {msg.id === "thinking" && (
                        <span className="ml-1 text-purple-500 animate-pulse">
                          đang suy nghĩ...
                        </span>
                      )}
                    </p>
                  )}
                  {msg.id === "thinking" ? (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                </div>
                {msg.id !== "thinking" && (
                  <p className="text-xs text-muted-foreground px-2">
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {!msg.isAI && (
                <Avatar className="h-8 w-8 border-2 border-purple-200">
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "K"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn..."
            className="min-h-[44px] max-h-[100px] resize-none focus-visible:ring-purple-500"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || sending}
            className="bg-purple-600 hover:bg-purple-700 h-[44px] px-4"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          💡 Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </p>
      </div>
    </div>
  );
}

