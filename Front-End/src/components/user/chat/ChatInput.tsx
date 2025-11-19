import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  isConnected: boolean;
  isSending: boolean;
  showStaffWarning?: boolean;
}

export default function ChatInput({ 
  onSendMessage, 
  isConnected, 
  isSending,
  showStaffWarning = false 
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const success = await onSendMessage(message);
    if (success) {
      setMessage("");
    }
  };

  return (
    <div className="border-t bg-white p-3 flex-shrink-0">
      {showStaffWarning && (
        <Alert className="mb-2.5 border-blue-200 bg-blue-50 py-2">
          <AlertDescription className="text-xs text-blue-700">
            💬 Nhân viên sẽ trả lời sớm nhất có thể
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={isSending || !isConnected}
          className="flex-1 text-sm rounded-full border-2 h-11 focus-visible:ring-1 px-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={isSending || !isConnected || !message.trim()}
          size="icon"
          className="flex-shrink-0 rounded-full h-11 w-11"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

