import { useState } from "react";
import { useNavigate } from "react-router";
import { orderService } from "@/services/order.service";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  XCircle,
  AlertTriangle,
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
  const pageSize = 3;

  // Convert date from yyyy-MM-dd to dd/MM/yyyy for API
  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Initialize default dates
  const getDefaultStartDate = () => {
    return "2020-12-01";
  };

  const getDefaultEndDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [startDateInput, setStartDateInput] = useState(getDefaultStartDate());
  const [endDateInput, setEndDateInput] = useState(getDefaultEndDate());
  // State for actual filter values (only updated when filter button is clicked)
  const [startDateFilter, setStartDateFilter] = useState(getDefaultStartDate());
  const [endDateFilter, setEndDateFilter] = useState(getDefaultEndDate());
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
    null
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  // Map status tab to API status parameter (multiple statuses)
  const getStatusParam = (statusTab: StatusTab): string[] | undefined => {
    const statusMap: Record<StatusTab, string[] | undefined> = {
      ALL: undefined,
      PENDING: ["PENDING", "PENDING_PAYMENT"],
      CONFIRMED: [
        "PROCESSING",
        "READY_FOR_PICKUP",
        "SHIPPED",
        "ASSIGNED_SHIPPER",
      ],
      DELIVERING: ["DELIVERING"],
      COMPLETED: ["COMPLETED"],
      CANCELLED: ["FAILED", "CANCELED", "PAYMENT_FAILED"],
    };
    return statusMap[statusTab];
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
        formatDateForAPI(startDateFilter) || undefined,
        formatDateForAPI(endDateFilter) || undefined
      ),
    {
      queryKey: [
        "myOrders",
        currentPage.toString(),
        activeTab,
        startDateFilter,
        endDateFilter,
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
    if (status === "PENDING") {
      return (
        <CustomBadge variant="warning">
          Chờ xác nhận
        </CustomBadge>
      );
    } else if (status === "PENDING_PAYMENT") {
      return (
        <CustomBadge variant="warning">
          Chờ thanh toán
        </CustomBadge>
      );
    } else if (status === "PROCESSING") {
      return (
        <CustomBadge variant="info">
          Đang xử lý
        </CustomBadge>
      );
    } else if (status === "READY_FOR_PICKUP") {
      return (
        <CustomBadge variant="info">
          Sẵn sàng lấy hàng
        </CustomBadge>
      );
    } else if (status === "SHIPPED") {
      return (
        <CustomBadge variant="info">
          Đã giao cho ĐVVC
        </CustomBadge>
      );
    } else if (status === "ASSIGNED_SHIPPER") {
      return (
        <CustomBadge variant="info">
          Đã phân shipper
        </CustomBadge>
      );
    } else if (status === "DELIVERING") {
      return (
        <CustomBadge variant="info">
          Đang giao hàng
        </CustomBadge>
      );
    } else if (status === "COMPLETED") {
      return (
        <CustomBadge variant="success">
          Hoàn thành
        </CustomBadge>
      );
    } else if (status === "FAILED") {
      return (
        <CustomBadge variant="error">
          Giao thất bại
        </CustomBadge>
      );
    } else if (status === "CANCELED") {
      return (
        <CustomBadge variant="error">Đã hủy</CustomBadge>
      );
    } else if (status === "PAYMENT_FAILED") {
      return (
        <CustomBadge variant="error">
          Thanh toán thất bại
        </CustomBadge>
      );
    }
    return <CustomBadge variant="secondary">{status}</CustomBadge>;
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
    setStartDateFilter(startDateInput);
    setEndDateFilter(endDateInput);
    setCurrentPage(1);
  };

  const openCancelDialog = (orderId: number) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setOrderToCancel(null);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrderId(orderToCancel);
      await orderService.cancelOrder(orderToCancel);
      toast.success("Hủy đơn hàng thành công");
      refetchOrders();
      closeCancelDialog();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      const errorMsg =
        error.response?.data?.message || "Không thể hủy đơn hàng";
      toast.error(errorMsg);
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  Xác nhận hủy đơn hàng
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Bạn có chắc chắn muốn hủy đơn hàng này không?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Sau khi hủy, đơn hàng sẽ không thể khôi phục lại. Nếu bạn đã thanh
              toán, số tiền sẽ được hoàn trả theo chính sách của chúng tôi.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeCancelDialog}
              disabled={cancellingOrderId !== null}
            >
              Không, giữ lại
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancellingOrderId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancellingOrderId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Xác nhận hủy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Tabs */}
      <div>
        <div className="p-0">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => handleTabChange("ALL")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleTabChange("PENDING")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "PENDING"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
              }`}
            >
              Chờ xác nhận
            </button>
            <button
              onClick={() => handleTabChange("CONFIRMED")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "CONFIRMED"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
              }`}
            >
              Đã xác nhận
            </button>
            <button
              onClick={() => handleTabChange("DELIVERING")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "DELIVERING"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
              }`}
            >
              Đang vận chuyển
            </button>
            <button
              onClick={() => handleTabChange("COMPLETED")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "COMPLETED"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
              }`}
            >
              Đã giao hàng
            </button>
            <button
              onClick={() => handleTabChange("CANCELLED")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "CANCELLED"
                  ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
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
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
              />
              <span className="text-gray-500">→</span>
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
              />
              <Button
                size="sm"
                onClick={handleFilter}
                disabled={isLoading}
                className="h-10 bg-red-600 hover:bg-red-700 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
            </div>
          </CardContent>
        </div>
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
                      <span className="text-sm text-gray-600">
                        Mã đơn hàng:
                      </span>
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
                            alt={
                              detail.productVariant?.productName || "Sản phẩm"
                            }
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
                            <span>
                              SKU: {detail.productVariant?.sku || "N/A"}
                            </span>
                            {detail.productVariant?.brandName && (
                              <>
                                <span>•</span>
                                <span>{detail.productVariant.brandName}</span>
                              </>
                            )}
                            {detail.productVariant?.categoryName && (
                              <>
                                <span>•</span>
                                <span>
                                  {detail.productVariant.categoryName}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Số lượng:{" "}
                              <span className="font-semibold">
                                {detail.quantity}
                              </span>
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
                              <span className="font-medium">
                                {order.receiverName}
                              </span>
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
                  <div className="flex justify-end gap-3">
                    {order.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelDialog(order.id)}
                        className="border-gray-400 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-400"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy đơn hàng
                      </Button>
                    )}
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
                    page === currentPage ? "bg-red-600 hover:bg-red-700" : ""
                  }
                >
                  {page}
                </Button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
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
