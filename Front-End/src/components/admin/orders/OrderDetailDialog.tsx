import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderResponse, OrderStatus } from "@/types/order.type";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderResponse | null;
  onConfirmOrder?: (orderId: number) => void;
  onCancelOrder?: (orderId: number) => void;
  onProcessOrder?: (orderId: number) => void;
  onCompleteOrder?: (orderId: number) => void;
  isConfirming?: boolean;
  isCanceling?: boolean;
  isProcessing?: boolean;
  isCompleting?: boolean;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: any; color: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    icon: Clock,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  PROCESSING: {
    label: "Đang xử lý",
    icon: Package,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  READY_FOR_PICKUP: {
    label: "Sẵn sàng lấy hàng",
    icon: Package,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  DELIVERING: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  SHIPPED: {
    label: "Chuẩn bị giao",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  FAILED: {
    label: "Thất bại",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  CANCELED: {
    label: "Đã hủy",
    icon: AlertCircle,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  PAYMENT_FAILED: {
    label: "Thanh toán thất bại",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  ASSIGNED_SHIPPER: {
    label: "Đã gán shipper",
    icon: Truck,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

const paymentMethodLabels: Record<string, string> = {
  CASH_ON_DELIVERY: "Tiền mặt khi nhận hàng",
  VN_PAY: "VNPay",
  PAY_OS: "PayOS",
};

export default function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onConfirmOrder,
  onCancelOrder,
  onProcessOrder,
  onCompleteOrder,
  isConfirming = false,
  isCanceling = false,
  isProcessing = false,
  isCompleting = false,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const canConfirm = order.status === "PENDING";
  const canCancel =
    order.status === "PENDING" ||
    order.status === "PROCESSING" ||
    order.status === "READY_FOR_PICKUP";
  const canProcess = order.status === "PROCESSING";
  const canComplete = order.status === "READY_FOR_PICKUP";

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

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const statusInfo = statusConfig[order.status] || statusConfig.PENDING;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết đơn hàng #{order.id}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Thông tin chi tiết về đơn hàng và khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Date */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Trạng thái đơn hàng</p>
              <Badge className={`${statusInfo.color} border`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Ngày đặt hàng</p>
              <p className="font-semibold text-gray-900">
                {formatDate(order.orderDate)}
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
                  {order.customer?.fullName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">
                  {order.customer?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Số điện thoại khách hàng
                </p>
                <p className="font-medium text-gray-900">
                  {order.customer?.phone || "N/A"}
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
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge
                  variant={order.isPickup ? "default" : "secondary"}
                  className={
                    order.isPickup
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-purple-100 text-purple-800 border-purple-200"
                  }
                >
                  {order.isPickup ? "Nhận tại quầy" : "Giao hàng tận nơi"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Người nhận</p>
                <p className="font-medium text-gray-900">
                  {order.receiverName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Số điện thoại người nhận
                </p>
                <p className="font-medium text-gray-900">
                  {order.receiverPhone}
                </p>
              </div>
              {!order.isPickup && (
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="font-medium text-gray-900">
                    {order.receiverAddress || "N/A"}
                  </p>
                </div>
              )}
              {order.note && (
                <div>
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="font-medium text-gray-900">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Products */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Sản phẩm ({order.orderDetails?.length || 0})
            </h4>
            <div className="space-y-2">
              {order.orderDetails?.map((item) => (
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
                    {item.productVariant?.brandName && (
                      <p className="text-sm text-gray-500">
                        Thương hiệu: {item.productVariant.brandName}
                      </p>
                    )}
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
                  {paymentMethodLabels[order.paymentMethod] ||
                    order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền hàng</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá</span>
                <span className="font-medium text-green-600">
                  -{formatPrice(order.totalDiscount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Tổng thanh toán
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(order.finalTotalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        {(canConfirm || canCancel || canProcess || canComplete) && (
          <DialogFooter className="mt-6 flex gap-3">
            {canConfirm && onConfirmOrder && (
              <Button
                onClick={() => onConfirmOrder(order.id)}
                disabled={
                  isConfirming || isCanceling || isProcessing || isCompleting
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConfirming ? (
                  <>
                    <span className="mr-2">Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Tiếp nhận đơn hàng
                  </>
                )}
              </Button>
            )}

            {canProcess && onProcessOrder && (
              <Button
                onClick={() => onProcessOrder(order.id)}
                disabled={
                  isConfirming || isCanceling || isProcessing || isCompleting
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <span className="mr-2">Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    {order.isPickup ? (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Sẵn sàng lấy hàng
                      </>
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />
                        Chuyển giao hàng
                      </>
                    )}
                  </>
                )}
              </Button>
            )}

            {canComplete && onCompleteOrder && (
              <Button
                onClick={() => onCompleteOrder(order.id)}
                disabled={
                  isConfirming || isCanceling || isProcessing || isCompleting
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCompleting ? (
                  <>
                    <span className="mr-2">Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Hoàn thành đơn hàng
                  </>
                )}
              </Button>
            )}

            {canCancel && onCancelOrder && (
              <Button
                onClick={() => onCancelOrder(order.id)}
                disabled={
                  isConfirming || isCanceling || isProcessing || isCompleting
                }
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isCanceling ? (
                  <>
                    <span className="mr-2">Đang hủy...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Hủy đơn hàng
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
