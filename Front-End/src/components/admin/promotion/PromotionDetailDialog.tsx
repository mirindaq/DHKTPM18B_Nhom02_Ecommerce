import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Target, Percent, Star } from "lucide-react";
import type { PromotionSummary } from "@/types/promotion.type";

interface PromotionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: PromotionSummary | null;
}

export default function PromotionDetailDialog({
  open,
  onOpenChange,
  promotion,
}: PromotionDetailDialogProps) {
  if (!promotion) return null;

  const getTypeLabel = (type: string) => {
    const labels = {
      ORDER: "Đơn hàng",
      PRODUCT: "Sản phẩm",
      PRODUCT_VARIANT: "Biến thể sản phẩm",
      CATEGORY: "Danh mục",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ORDER: "bg-blue-100 text-blue-800",
      PRODUCT: "bg-green-100 text-green-800",
      PRODUCT_VARIANT: "bg-purple-100 text-purple-800",
      CATEGORY: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDiscountText = (promotion: PromotionSummary) => {
    if (promotion.discountType === "PERCENTAGE") {
      return `${promotion.discountValue}%`;
    }
    return `${promotion.discountValue.toLocaleString()}đ`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Chi tiết chương trình khuyến mãi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin cơ bản</span>
                <Badge variant={promotion.active ? "default" : "secondary"}>
                  {promotion.active ? "Hoạt động" : "Tạm dừng"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{promotion.name}</h4>
                <p className="text-gray-600 mt-1">{promotion.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Loại:</span>
                  <Badge className={getTypeColor(promotion.type)}>
                    {getTypeLabel(promotion.type)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Giảm giá:</span>
                  <span className="font-semibold text-green-600">
                    {getDiscountText(promotion)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Đối tượng áp dụng</label>
                  <p className="text-sm">Tất cả sản phẩm</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Độ ưu tiên</label>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{promotion.priority}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thời gian */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thời gian áp dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày bắt đầu</label>
                  <p className="text-sm">{formatDate(promotion.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày kết thúc</label>
                  <p className="text-sm">{formatDate(promotion.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
}
