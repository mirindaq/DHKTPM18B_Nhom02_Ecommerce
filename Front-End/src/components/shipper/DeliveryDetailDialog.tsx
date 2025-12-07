import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  DeliveryAssignment,
  DeliveryStatus,
} from "@/types/delivery-assignment.type";
import {
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  User,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import CompleteDeliveryDialog from "./CompleteDeliveryDialog";

interface DeliveryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: DeliveryAssignment | null;
  onStartDelivery?: (deliveryId: number) => void;
  onCompleteDelivery?: (
    deliveryId: number,
    note?: string,
    images?: string[]
  ) => void;
  onFailDelivery?: (
    deliveryId: number,
    note?: string,
    images?: string[]
  ) => void;
  isStarting?: boolean;
  isCompleting?: boolean;
  isFailing?: boolean;
}

const statusConfig: Record<
  DeliveryStatus,
  { label: string; icon: any; color: string }
> = {
  ASSIGNED: {
    label: "Đã gán",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  DELIVERING: {
    label: "Đang giao",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  DELIVERED: {
    label: "Đã giao",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  FAILED: {
    label: "Thất bại",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

const paymentMethodLabels: Record<string, string> = {
  CASH_ON_DELIVERY: "Tiền mặt khi nhận hàng",
  VN_PAY: "VNPay",
  PAY_OS: "PayOS",
};

export default function DeliveryDetailDialog({
  open,
  onOpenChange,
  delivery,
  onStartDelivery,
  onCompleteDelivery,
  onFailDelivery,
  isStarting = false,
  isCompleting = false,
  isFailing = false,
}: DeliveryDetailDialogProps) {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionType, setCompletionType] = useState<"complete" | "fail">(
    "complete"
  );

  if (!delivery || !delivery.order) return null;

  const canStart = delivery.deliveryStatus === "ASSIGNED";
  const canComplete = delivery.deliveryStatus === "DELIVERING";
  const isCompleted =
    delivery.deliveryStatus === "DELIVERED" ||
    delivery.deliveryStatus === "FAILED";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatusIcon = statusConfig[delivery.deliveryStatus]?.icon || Clock;
  const statusInfo =
    statusConfig[delivery.deliveryStatus] || statusConfig.ASSIGNED;

  const handleComplete = () => {
    setCompletionType("complete");
    setIsCompleteDialogOpen(true);
  };

  const handleFail = () => {
    setCompletionType("fail");
    setIsCompleteDialogOpen(true);
  };

  const handleConfirmCompletion = (note?: string, images?: string[]) => {
    if (completionType === "complete" && onCompleteDelivery) {
      onCompleteDelivery(delivery.id, note, images);
    } else if (completionType === "fail" && onFailDelivery) {
      onFailDelivery(delivery.id, note, images);
    }
    setIsCompleteDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Chi tiết đơn hàng #{delivery.order.id}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Thông tin chi tiết về đơn hàng và giao hàng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Date */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Trạng thái giao hàng
                </p>
                <CustomBadge className={`${statusInfo.color} border`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusInfo.label}
                </CustomBadge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ngày được gán</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(delivery.createdAt)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin khách hàng
              </h4>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Tên khách hàng</p>
                  <p className="font-medium text-gray-900">
                    {delivery.order.customer?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {delivery.order.customer?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Số điện thoại khách hàng
                  </p>
                  <p className="font-medium text-gray-900">
                    {delivery.order.customer?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Delivery Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin giao hàng
              </h4>
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600">Người nhận</p>
                    <p className="font-medium text-gray-900">
                      {delivery.order.receiverName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600">Số điện thoại</p>
                    <p className="font-medium text-gray-900">
                      {delivery.order.receiverPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <p className="text-xs text-blue-600">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900">
                      {delivery.order.receiverAddress || "N/A"}
                    </p>
                  </div>
                </div>
                {delivery.expectedDeliveryDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600">Ngày dự kiến giao</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(delivery.expectedDeliveryDate)}
                      </p>
                    </div>
                  </div>
                )}
                {delivery.deliveredAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600">Đã giao lúc</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(delivery.deliveredAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Note and Images (if completed/failed) */}
            {isCompleted && (delivery.note || delivery.deliveryImages) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Thông tin xử lý
                  </h4>
                  <div className="space-y-3">
                    {delivery.note && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                        <p className="text-gray-900">{delivery.note}</p>
                      </div>
                    )}
                    {delivery.deliveryImages &&
                      delivery.deliveryImages.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Hình ảnh xác nhận ({delivery.deliveryImages.length})
                          </p>
                          <div className="grid grid-cols-4 gap-3">
                            {delivery.deliveryImages.map((image, index) => (
                              <div
                                key={index}
                                className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={image}
                                  alt={`Hình ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/assets/avatar.jpg";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Products */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Sản phẩm ({delivery.order.orderDetails?.length || 0})
              </h4>
              <div className="space-y-2">
                {delivery.order.orderDetails?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={
                          item.productVariant?.productThumbnail ||
                          "/assets/avatar.jpg"
                        }
                        alt={item.productVariant?.productName || "Product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/avatar.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.productVariant?.productName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        SKU: {item.productVariant?.sku || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.finalPrice)}
                      </p>
                      {item.discount > 0 && (
                        <>
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-green-600">
                            -{item.discount}%
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payment Summary */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Thông tin thanh toán
              </h4>
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán</span>
                  <span className="font-medium text-gray-900">
                    {paymentMethodLabels[delivery.order.paymentMethod] ||
                      delivery.order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền hàng</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(delivery.order.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium text-green-600">
                    -{formatPrice(delivery.order.totalDiscount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(delivery.order.finalTotalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Action Buttons */}
          {(canStart || canComplete) && (
            <DialogFooter className="mt-6 flex gap-3">
              {canStart && onStartDelivery && (
                <Button
                  onClick={() => onStartDelivery(delivery.id)}
                  disabled={isStarting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isStarting ? (
                    <span>Đang xử lý...</span>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Bắt đầu giao hàng
                    </>
                  )}
                </Button>
              )}

              {canComplete && (
                <>
                  <Button
                    onClick={handleFail}
                    disabled={isCompleting || isFailing}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isFailing ? (
                      <span>Đang xử lý...</span>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Giao thất bại
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting || isFailing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isCompleting ? (
                      <span>Đang xử lý...</span>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Hoàn thành giao hàng
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete/Fail Delivery Dialog */}
      <CompleteDeliveryDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        type={completionType}
        onConfirm={handleConfirmCompletion}
        isSubmitting={completionType === "complete" ? isCompleting : isFailing}
      />
    </>
  );
}
