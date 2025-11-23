import { useState } from "react";
import { useNavigate } from "react-router";
import { orderService } from "@/services/order.service";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  CreditCard,
  ShoppingBag,
  Eye,
} from "lucide-react";
import type { OrderListResponse, OrderStatus } from "@/types/order.type";
import { PUBLIC_PATH } from "@/constants/path";
import { toast } from "sonner";

type StatusTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export default function OrderHistory() {
  const navigate = useNavigate();
  const pageSize = 10;

  // Format date to dd/MM/yyyy for API
  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Initialize default dates
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setFullYear(2020, 11, 1); // December 1, 2020
    return formatDateForAPI(date);
  };

  const getDefaultEndDate = () => {
    return formatDateForAPI(new Date());
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  // Map status tab to API status parameter (single status)
  const getStatusParam = (statusTab: StatusTab): string | undefined => {
    if (statusTab === "PENDING") {
      return "PENDING";
    } else if (statusTab === "CONFIRMED") {
      return "PROCESSING";
    } else if (statusTab === "DELIVERING") {
      return "DELIVERING";
    } else if (statusTab === "COMPLETED") {
      return "COMPLETED";
    } else if (statusTab === "CANCELLED") {
      return "CANCELED";
    }
    return undefined; // ALL - không gửi status param
  };

  // Fetch orders using useQuery
  const {
    data: ordersData,
    isLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery<OrderListResponse>(
    () =>
      orderService.getMyOrders(
        currentPage,
        pageSize,
        getStatusParam(activeTab),
        startDate || undefined,
        endDate || undefined
      ),
    {
      queryKey: [
        "myOrders",
        currentPage.toString(),
        activeTab,
        startDate,
        endDate,
      ],
      onError: (err) => {
        console.error("Error fetching orders:", err);
        const error = err as any;
        const errorMsg =
          error.response?.data?.message || "Không thể tải lịch sử đơn hàng";
        toast.error(errorMsg);
      },
    }
  );

  const orders = ordersData?.data?.data || [];
  const totalPages = ordersData?.data?.totalPage || 1;

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

  const handleViewDetail = (orderId: number) => {
    navigate(`${PUBLIC_PATH.HOME}profile/orders/${orderId}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleFilter = () => {
    // Validate date format (dd/MM/yyyy)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (startDate && !dateRegex.test(startDate)) {
      toast.error("Ngày bắt đầu không đúng định dạng (dd/MM/yyyy)");
      return;
    }
    if (endDate && !dateRegex.test(endDate)) {
      toast.error("Ngày kết thúc không đúng định dạng (dd/MM/yyyy)");
      return;
    }

    setCurrentPage(1);
    refetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Lịch sử mua hàng</h1>
        <p className="text-gray-600">
          Xem và quản lý tất cả đơn hàng của bạn
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => handleTabChange("ALL")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "ALL"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleTabChange("PENDING")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "PENDING"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Chờ xác nhận
            </button>
            <button
              onClick={() => handleTabChange("CONFIRMED")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "CONFIRMED"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Đã xác nhận
            </button>
            <button
              onClick={() => handleTabChange("DELIVERING")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "DELIVERING"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Đang vận chuyển
            </button>
            <button
              onClick={() => handleTabChange("COMPLETED")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "COMPLETED"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Đã giao hàng
            </button>
            <button
              onClick={() => handleTabChange("CANCELLED")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "CANCELLED"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Đã hủy
            </button>
          </div>

          {/* Date Filter */}
          <div className="p-4 border-b flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              Lọc theo ngày:
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-32 h-9 text-sm"
                placeholder="dd/MM/yyyy"
                maxLength={10}
              />
              <span className="text-gray-500">→</span>
              <Input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-32 h-9 text-sm"
                placeholder="dd/MM/yyyy"
                maxLength={10}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={handleFilter}
                disabled={isLoading}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
            </div>
          </CardContent>
        </Card>
      ) : ordersError ? (
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>
            Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có đơn hàng nào trong danh mục này
              </p>
              <Button
                onClick={() => navigate(PUBLIC_PATH.HOME)}
                className="bg-red-600 hover:bg-red-700"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mua sắm ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-b">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                      <span className="font-bold text-gray-900 ml-2">
                        #WN0{order.id.toString().padStart(10, "0")}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Order Content */}
                <div className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.orderDetails.map((detail) => (
                      <div
                        key={detail.id}
                        className="flex items-start gap-4 pb-4 border-b last:border-0"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={
                              detail.productVariant?.productThumbnail ||
                              "https://via.placeholder.com/80x80?text=No+Image"
                            }
                            alt={detail.productVariant?.productName || "Sản phẩm"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/80x80?text=No+Image";
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
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
                              Giá:{" "}
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

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {order.isPickup ? "Nhận tại cửa hàng" : "Giao hàng"}
                          </h5>
                          {!order.isPickup && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{order.receiverName}</span>
                              <br />
                              <span>{order.receiverPhone}</span>
                              <br />
                              <span>{order.receiverAddress}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            Phương thức thanh toán
                          </h5>
                          <p className="text-sm text-gray-600">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span className="font-medium">
                          {formatPrice(order.totalPrice)}
                        </span>
                      </div>
                      {order.totalDiscount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giảm giá:</span>
                          <span className="font-medium text-green-600">
                            -{formatPrice(order.totalDiscount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-base pt-2 border-t border-red-200">
                        <span className="font-bold">Tổng thanh toán:</span>
                        <span className="font-bold text-red-600 text-lg">
                          {formatPrice(order.finalTotalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(order.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                  className={
                    page === currentPage
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  {page}
                </Button>
              );
            } else if (
              page === currentPage - 2 ||
              page === currentPage + 2
            ) {
              return (
                <span key={page} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            return null;
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
