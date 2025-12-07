import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import type { Feedback } from "@/types/feedback.type";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: Feedback | null;
}

export default function FeedbackDialog({
  open,
  onOpenChange,
  feedback,
}: FeedbackDialogProps) {
  if (!feedback) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">
          ({rating}/5)
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết đánh giá
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Xem thông tin chi tiết đánh giá của khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              Thông tin khách hàng
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-base font-medium text-gray-900">
                {feedback.customerName}
              </p>
              <p className="text-sm text-gray-600">ID: {feedback.customerId}</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Sản phẩm</h3>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
              {feedback.productImage && (
                <img
                  src={feedback.productImage}
                  alt={feedback.productName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-base font-medium text-gray-900">
                  {feedback.productName}
                </p>
                <p className="text-sm text-gray-600">
                  Mã đơn hàng: #{feedback.orderId}
                </p>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Đánh giá</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderRating(feedback.rating)}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Nhận xét</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">
                {feedback.comment || "Không có nhận xét"}
              </p>
            </div>
          </div>

          {/* Images */}
          {feedback.imageUrls && feedback.imageUrls.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Hình ảnh ({feedback.imageUrls.length})
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {feedback.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Feedback image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Trạng thái
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    feedback.status
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {feedback.status ? "Hiển thị" : "Ẩn"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Ngày tạo</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
