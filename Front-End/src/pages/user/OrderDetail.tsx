import { useNavigate, useParams } from "react-router";
import { orderService } from "@/services/order.service";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MapPin,
  ChevronLeft,
  Loader2,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import type { OrderApiResponse, OrderStatus } from "@/types/order.type";
import { PUBLIC_PATH } from "@/constants/path";
import { toast } from "sonner";

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch order detail using useQuery
  const {
    data: orderData,
    isLoading,
    error: orderError,
  } = useQuery<OrderApiResponse>(
    () => {
      if (!id) throw new Error("Order ID is required");
      return orderService.getOrderDetailById(parseInt(id));
    },
    {
      queryKey: ["orderDetail", id || ""],
      enabled: !!id,
      onError: (err) => {
        console.error("Error fetching order detail:", err);
        const error = err as any;
        const errorMsg =
          error.response?.data?.message || "Không thể tải thông tin đơn hàng";
        toast.error(errorMsg);
      },
    }
  );

  const order = orderData?.data;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: OrderStatus) => {
    if (["PENDING", "PENDING_PAYMENT"].includes(status)) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
          Chờ xác nhận
        </Badge>
      );
    } else if (["PROCESSING", "READY_FOR_PICKUP", "SHIPPED"].includes(status)) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          Đã xác nhận
        </Badge>
      );
    } else if (status === "DELIVERING") {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-300">
          Đang vận chuyển
        </Badge>
      );
    } else if (status === "COMPLETED") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          Hoàn thành
        </Badge>
      );
    } else if (["FAILED", "CANCELED", "PAYMENT_FAILED"].includes(status)) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-300">Đã hủy</Badge>
      );
    }
    return <Badge>{status}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Thanh toán khi nhận hàng";
      case "VN_PAY":
        return "VNPay";
      case "PAY_OS":
        return "PayOS";
      default:
        return method;
    }
  };

  const getStatusSteps = (status: OrderStatus) => {
    const steps: Array<{
      key: string;
      label: string;
      icon: typeof CheckCircle2;
      completed: boolean;
      date?: string;
    }> = [
      {
        key: "ordered",
        label: "Đặt hàng thành công",
        icon: CheckCircle2,
        completed: true,
        date: order?.orderDate,
      },
      {
        key: "confirmed",
        label: "Đã xác nhận",
        icon: Clock,
        completed: ["PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERING", "COMPLETED"].includes(status),
      },
      {
        key: "shipping",
        label: "Đang vận chuyển",
        icon: Truck,
        completed: ["DELIVERING", "COMPLETED"].includes(status),
      },
      {
        key: "completed",
        label: "Đã nhận hàng",
        icon: CheckCircle2,
        completed: status === "COMPLETED",
      },
    ];

    if (["FAILED", "CANCELED", "PAYMENT_FAILED"].includes(status)) {
      return [
        {
          key: "ordered",
          label: "Đặt hàng thành công",
          icon: CheckCircle2,
          completed: true,
          date: order?.orderDate,
        },
        {
          key: "cancelled",
          label: "Đã hủy",
          icon: XCircle,
          completed: true,
        },
      ] as typeof steps;
    }

    return steps;
  };

  const handleBack = () => {
    navigate(`${PUBLIC_PATH.HOME}profile/orders`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="space-y-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>
            {orderError
              ? "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
              : "Không tìm thấy đơn hàng."}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h1>
          <p className="text-gray-600">
            Mã đơn hàng: #WN0{order.id.toString().padStart(10, "0")}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Ngày đặt hàng: {formatDate(order.orderDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-6">Trạng thái đơn hàng</h3>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === statusSteps.length - 1;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-medium text-center ${
                        step.completed ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.date && (
                      <span className="text-xs text-gray-500 mt-1">
                        {formatDate(step.date)}
                      </span>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        step.completed ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Sản phẩm đã đặt</h3>
              <div className="space-y-4">
                {order.orderDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={
                          detail.productVariant?.productThumbnail ||
                          "https://via.placeholder.com/96x96?text=No+Image"
                        }
                        alt={detail.productVariant?.productName || "Sản phẩm"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/96x96?text=No+Image";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {detail.productVariant?.productName || "Sản phẩm"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>SKU: {detail.productVariant?.sku || "N/A"}</span>
                        {detail.productVariant?.brandName && (
                          <>
                            <span>•</span>
                            <span>{detail.productVariant.brandName}</span>
                          </>
                        )}
                        {detail.productVariant?.categoryName && (
                          <>
                            <span>•</span>
                            <span>{detail.productVariant.categoryName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Số lượng:{" "}
                          <span className="font-semibold">{detail.quantity}</span>
                        </span>
                        <span className="text-gray-600">
                          Đơn giá:{" "}
                          <span className="font-semibold">
                            {formatPrice(detail.price)}
                          </span>
                        </span>
                        {detail.discount > 0 && (
                          <span className="text-green-600">
                            Giảm: -{formatPrice(detail.discount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Final Price */}
                    <div className="text-right shrink-0">
                      <div className="font-bold text-red-600">
                        {formatPrice(detail.finalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <h3 className="font-bold text-lg">
                    {order.isPickup ? "Nhận tại cửa hàng" : "Thông tin giao hàng"}
                  </h3>
                </div>
                {!order.isPickup && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Người nhận:</span>
                      <p className="font-semibold">{order.receiverName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Số điện thoại:</span>
                      <p className="font-semibold">{order.receiverPhone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Địa chỉ:</span>
                      <p className="font-semibold">{order.receiverAddress}</p>
                    </div>
                  </div>
                )}
                {order.note && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-gray-600 text-sm">Ghi chú:</span>
                    <p className="text-gray-800 text-sm mt-1">{order.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <h3 className="font-bold text-lg">Phương thức thanh toán</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Phương thức:</span>
                    <p className="font-semibold">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Tóm tắt thanh toán</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng sản phẩm:</span>
                  <span className="font-semibold">
                    {order.orderDetails.reduce(
                      (sum, d) => sum + d.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền hàng:</span>
                  <span className="font-semibold">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-semibold text-green-600">
                      -{formatPrice(order.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Tổng thanh toán:</span>
                    <span className="font-bold text-red-600 text-lg">
                      {formatPrice(order.finalTotalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    (Đã bao gồm VAT)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
