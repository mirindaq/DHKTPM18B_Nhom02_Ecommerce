import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Loader2, Image as ImageIcon, X } from "lucide-react";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string, messageType?: "TEXT" | "IMAGE") => Promise<boolean>;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetImage = (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file PNG, JPG, JPEG, GIF');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return false;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetImage(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          validateAndSetImage(file);
        }
        break;
      }
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('paste', handlePaste as any);
      return () => {
        inputElement.removeEventListener('paste', handlePaste as any);
      };
    }
  }, []);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;

    if (selectedImage) {
      try {
        setUploading(true);
        const response = await uploadService.uploadImage([selectedImage]);
        
        if (response.data && response.data.length > 0) {
          const imageUrl = response.data[0];
          success = await onSendMessage(imageUrl, "IMAGE");
          
          if (success) {
            handleRemoveImage();
          }
        }
      } catch (error) {
        toast.error('Upload ảnh thất bại');
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    } else if (message.trim()) {
      success = await onSendMessage(message, "TEXT");
      if (success) {
        setMessage("");
      }
    }
  };

  const isDisabled = isSending || uploading || !isConnected;
  const canSend = selectedImage ? !isDisabled : (message.trim() && !isDisabled);

  return (
    <div className="border-t bg-white p-3 flex-shrink-0">
      {showStaffWarning && (
        <Alert className="mb-2.5 border-blue-200 bg-blue-50 py-2">
          <AlertDescription className="text-xs text-blue-700">
            💬 Nhân viên sẽ trả lời sớm nhất có thể
          </AlertDescription>
        </Alert>
      )}

      {imagePreview && (
        <div className="mb-3 relative">
          <div className="relative w-fit">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-40 h-40 rounded-lg border-2 border-gray-300 shadow-sm object-cover bg-gray-50"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg z-10"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
            <span>📷</span>
            <span>Nhấn Ctrl+V để thay đổi ảnh</span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="flex-shrink-0 rounded-full h-11 w-11"
          disabled={isDisabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn (Ctrl+V để dán ảnh)..."
          disabled={isDisabled || !!selectedImage}
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
          disabled={!canSend}
          size="icon"
          className="flex-shrink-0 rounded-full h-11 w-11"
        >
          {isSending || uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

