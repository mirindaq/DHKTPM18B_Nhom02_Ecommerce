import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Calendar,
  MapPin,
  Home,
  ShoppingBag,
  Search,
  Heart,
  GraduationCap,
  User,
  MessageSquare,
  Book,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import type { OrderResponse } from "@/types/order.type";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { PUBLIC_PATH } from "@/constants/path";

type StatusTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [activeSidebarMenu, setActiveSidebarMenu] =
    useState<string>("Lịch sử mua hàng");
  const [startDate, setStartDate] = useState("01/12/2020");
  const [endDate, setEndDate] = useState(
    new Date().toLocaleDateString("en-GB")
  );

  const pageSize = 10;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate(PUBLIC_PATH.HOME);
    } catch (error) {
      console.error("Logout error:", error);
      navigate(PUBLIC_PATH.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMenuClick = (label: string) => {
    setActiveSidebarMenu(label);
    if (label === "Lịch sử mua hàng") {
      // Already here
    } else if (label === "Tổng quan") {
      navigate(`${PUBLIC_PATH.HOME}profile`);
    } else if (label === "Hạng thành viên và ưu đãi") {
      navigate(`${PUBLIC_PATH.HOME}profile/membership`);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Home size={20} />,
      label: "Tổng quan",
      active: activeSidebarMenu === "Tổng quan",
      onClick: () => handleMenuClick("Tổng quan"),
    },
    {
      icon: <ShoppingBag size={20} />,
      label: "Lịch sử mua hàng",
      active: activeSidebarMenu === "Lịch sử mua hàng",
      onClick: () => handleMenuClick("Lịch sử mua hàng"),
    },
    { icon: <Search size={20} />, label: "Tra cứu bảo hành" },
    {
      icon: <Heart size={20} />,
      label: "Hạng thành viên và ưu đãi",
      active: activeSidebarMenu === "Hạng thành viên và ưu đãi",
      onClick: () => handleMenuClick("Hạng thành viên và ưu đãi"),
    },
    {
      icon: <GraduationCap size={20} />,
      label: "Ưu đãi S-Student và S-Teacher",
    },
    { icon: <User size={20} />, label: "Thông tin tài khoản" },
    { icon: <MapPin size={20} />, label: "Tìm kiếm cửa hàng" },
    { icon: <Shield size={20} />, label: "Chính sách bảo hành" },
    { icon: <MessageSquare size={20} />, label: "Góp ý - Phản hồi - Hỗ trợ" },
    { icon: <Book size={20} />, label: "Điều khoản sử dụng" },
    {
      icon: isLoggingOut ? (
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut size={20} />
      ),
      label: isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  // Fetch orders
  useEffect(() => {
    fetchOrders(currentPage, activeTab);
  }, [currentPage, activeTab]);

  const fetchOrders = async (page: number, statusTab: StatusTab) => {
    try {
      setIsLoading(true);

      // Map status tab to API status parameter
      let statusParam = "";
      if (statusTab === "PENDING") {
        statusParam = "PENDING,PENDING_PAYMENT";
      } else if (statusTab === "CONFIRMED") {
        statusParam = "PROCESSING,READY_FOR_PICKUP,SHIPPED";
      } else if (statusTab === "DELIVERING") {
        statusParam = "DELIVERING";
      } else if (statusTab === "COMPLETED") {
        statusParam = "COMPLETED";
      } else if (statusTab === "CANCELLED") {
        statusParam = "FAILED,CANCELED,PAYMENT_FAILED";
      }

      // API expects dd/MM/yyyy format, so send dates as-is
      const response = await orderService.getMyOrders(
        page,
        pageSize,
        statusParam,
        startDate,
        endDate
      );

      setOrders(response.data.data || []);
      setTotalPages(response.data.totalPage || 1);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

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
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
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

  const handleViewDetail = (orderId: number) => {
    navigate(`/orders/${orderId}`);
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

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 py-6 px-4">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="overflow-hidden sticky top-4">
              <CardContent className="p-0">
                {menuItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={item.onClick}
                    disabled={!item.onClick && !item.active}
                    variant="ghost"
                    className={`
                      w-full justify-start gap-3 rounded-none text-sm font-medium py-3 px-4
                      ${
                        item.active
                          ? "bg-red-50 text-red-600 border-l-4 border-red-600 hover:bg-red-50"
                          : "border-l-4 border-transparent hover:bg-gray-50"
                      }
                      ${
                        !item.onClick && !item.active
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => navigate(`${PUBLIC_PATH.HOME}profile`)}
                >
                  Lịch sử mua hàng
                </span>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  Chi tiết đơn hàng
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg mb-4">
              <div className="flex border-b">
                <button
                  onClick={() => handleTabChange("ALL")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "ALL"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => handleTabChange("PENDING")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "PENDING"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Chờ xác nhận
                </button>
                <button
                  onClick={() => handleTabChange("CONFIRMED")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "CONFIRMED"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Đã xác nhận
                </button>
                <button
                  onClick={() => handleTabChange("DELIVERING")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "DELIVERING"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Đang vận chuyển
                </button>
                <button
                  onClick={() => handleTabChange("COMPLETED")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "COMPLETED"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Đã giao hàng
                </button>
                <button
                  onClick={() => handleTabChange("CANCELLED")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "CANCELLED"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Đã hủy
                </button>
              </div>

              {/* Date Filter */}
              <div className="p-4 border-b flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Lịch sử mua hàng
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-32 h-9 text-sm"
                    placeholder="dd/mm/yyyy"
                  />
                  <span className="text-gray-500">→</span>
                  <Input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-32 h-9 text-sm"
                    placeholder="dd/mm/yyyy"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => fetchOrders(1, activeTab)}
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Chưa có đơn hàng nào
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Bạn chưa có đơn hàng nào trong danh mục này
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Mua sắm ngay
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Order Header */}
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-gray-900">
                            Đơn hàng: #WN0
                            {order.id.toString().padStart(10, "0")}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">
                            Ngày đặt hàng:{" "}
                            <span className="font-medium text-gray-900">
                              {formatDate(order.orderDate)}
                            </span>
                          </span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Order Content */}
                      <div className="p-4">
                        {/* Product Info */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0">
                            <Package className="w-10 h-10 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {order.orderDetails[0]?.productVariant
                                ? `SKU: ${order.orderDetails[0].productVariant.sku}`
                                : "Sản phẩm"}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatPrice(order.orderDetails[0]?.price || 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">
                              Số lượng:{" "}
                              <span className="font-semibold">
                                {order.orderDetails.reduce(
                                  (sum, d) => sum + d.quantity,
                                  0
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tổng tiền hàng:
                            </span>
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
                          <div className="flex justify-between text-base pt-2 border-t">
                            <span className="font-semibold">
                              Tổng thanh toán
                            </span>
                            <span className="font-bold text-red-600 text-lg">
                              {formatPrice(order.finalTotalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(order.id)}
                            className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Xem chi tiết →
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
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
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
                  }
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
