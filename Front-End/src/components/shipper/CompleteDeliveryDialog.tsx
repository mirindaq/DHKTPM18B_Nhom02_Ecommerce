import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";

interface CompleteDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "complete" | "fail";
  onConfirm: (note?: string, images?: string[]) => void;
  isSubmitting?: boolean;
}

export default function CompleteDeliveryDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
  isSubmitting = false,
}: CompleteDeliveryDialogProps) {
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const filesToUpload = Array.from(files);

      // Validate files
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} không phải là file ảnh`);
          setIsUploading(false);
          event.target.value = "";
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} quá lớn (max 5MB)`);
          setIsUploading(false);
          event.target.value = "";
          return;
        }
      }

      // Upload all files at once
      const response = await uploadService.uploadImage(filesToUpload);
      if (response.data && response.data.length > 0) {
        setImages((prev) => [...prev, ...response.data]);
        toast.success(`Đã tải lên ${response.data.length} ảnh`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    onConfirm(note || undefined, images.length > 0 ? images : undefined);
    // Reset form
    setNote("");
    setImages([]);
  };

  const handleCancel = () => {
    setNote("");
    setImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {type === "complete"
              ? "Hoàn thành giao hàng"
              : "Giao hàng thất bại"}
          </DialogTitle>
          <DialogDescription>
            {type === "complete"
              ? "Vui lòng cung cấp thông tin xác nhận giao hàng thành công"
              : "Vui lòng cung cấp lý do và hình ảnh minh chứng"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Note Input */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Ghi chú{" "}
              {type === "fail" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="note"
              placeholder={
                type === "complete"
                  ? "Ghi chú về việc giao hàng (tùy chọn)..."
                  : "Mô tả lý do giao hàng thất bại..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Hình ảnh{" "}
              {type === "fail" && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  disabled={isUploading || isSubmitting}
                  className="relative"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Tải ảnh lên
                    </>
                  )}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="text-sm text-gray-500">
                  (Tối đa 5MB/ảnh, chọn nhiều ảnh cùng lúc)
                </span>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <img
                        src={imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/avatar.jpg";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isUploading || isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {images.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Chưa có ảnh nào được tải lên
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {type === "complete"
                      ? "Tải lên ảnh xác nhận giao hàng"
                      : "Tải lên ảnh minh chứng"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading || isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isUploading ||
              isSubmitting ||
              (type === "fail" && (!note.trim() || images.length === 0))
            }
            className={
              type === "complete"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                {type === "complete"
                  ? "Xác nhận hoàn thành"
                  : "Xác nhận thất bại"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
