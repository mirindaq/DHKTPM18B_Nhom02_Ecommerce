import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
}

export default function ChatHeader({  onClose }: ChatHeaderProps) {
  return (
    <div className="border-b bg-white p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm">
              Hỗ trợ khách hàng
            </h3>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-white/50 flex-shrink-0 ml-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

