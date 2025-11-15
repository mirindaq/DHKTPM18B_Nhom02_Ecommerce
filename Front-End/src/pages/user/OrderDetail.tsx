import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MapPin,
  Phone,
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
} from "lucide-react";
import { orderService } from "@/services/order.service";
import type { OrderResponse } from "@/types/order.type";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { PUBLIC_PATH } from "@/constants/path";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { logout } = useUser();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSidebarMenu] = useState<string>("Lịch sử mua hàng");

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
    if (label === "Lịch sử mua hàng") {
      navigate("/orders");
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

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      // Giả sử có API getOrderById, nếu chưa có thì cần thêm vào order.service.ts
      // Tạm thời fetch tất cả orders và filter theo id
      const response = await orderService.getMyOrders(1, 100);
      const foundOrder = response.data.data.find(
        (o: OrderResponse) => o.id.toString() === id
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error("Không tìm thấy đơn hàng");
        navigate("/orders");
      }
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast.error("Không thể tải thông tin đơn hàng");
      navigate("/orders");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy đơn hàng
            </h2>
            <Button
              onClick={() => navigate("/orders")}
              className="bg-red-600 hover:bg-red-700 mt-4"
            >
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
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
            {/* Breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/orders")}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Lịch sử mua hàng
                </Button>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  Chi tiết đơn hàng
                </span>
              </div>
            </div>

            {/* Order Summary Card */}
            <Card className="bg-gray-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      Đơn hàng: #WN0{order.id.toString().padStart(10, "0")}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      Ngày đặt hàng:{" "}
                      <span className="font-medium">
                        {formatDate(order.orderDate)}
                      </span>
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Product Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {order.orderDetails[0]?.productVariant
                        ? `SKU: ${order.orderDetails[0].productVariant.sku}`
                        : "Sản phẩm"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatPrice(order.orderDetails[0]?.price || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Số lượng:{" "}
                      <span className="font-semibold">
                        {order.orderDetails.reduce(
                          (sum, d) => sum + d.quantity,
                          0
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Steps */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mb-2">
                      ✓
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      Đặt hàng thành công
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                  <div className="w-24 h-0.5 bg-gray-300"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                      <span className="text-gray-600"></span>
                    </div>
                    <span className="text-sm text-gray-600">Đã xác nhận</span>
                  </div>
                  <div className="w-24 h-0.5 bg-gray-300"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                      <span className="text-gray-600"></span>
                    </div>
                    <span className="text-sm text-gray-600">Đã nhận hàng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-4">
                      Thông tin khách hàng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Họ và tên:</span>
                        <span className="font-semibold">
                          {order.receiverName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số điện thoại:</span>
                        <span className="font-semibold">
                          {order.receiverPhone}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-600">Địa chỉ:</span>
                        <span className="font-semibold text-right">
                          {order.isPickup
                            ? "Nhận tại cửa hàng"
                            : order.receiverAddress}
                        </span>
                      </div>
                      {order.note && (
                        <div className="flex flex-col gap-1 pt-2 border-t">
                          <span className="text-gray-600">Ghi chú:</span>
                          <span className="text-gray-800">{order.note}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Support Info */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-4">
                      Thông tin hỗ trợ
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Địa chỉ cửa hàng:
                          </p>
                          <p className="text-sm text-gray-600">
                            190 Nguyễn Thị Định, khu phố 2, P. An Phú, Q.2, TP.
                            HCM
                          </p>
                          <Button
                            variant="link"
                            className="text-red-600 h-auto p-0 text-sm"
                          >
                            Chi đường
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Số điện thoại:</p>
                          <p className="text-sm text-gray-600">02871010190</p>
                        </div>
                        <Button
                          variant="link"
                          className="text-red-600 h-auto p-0 ml-auto text-sm"
                        >
                          Liên hệ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warranty Center */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-4">
                      Trung tâm bảo hành
                    </h3>
                    <div className="space-y-2 text-sm">
                      <Button
                        variant="link"
                        className="text-red-600 h-auto p-0 justify-start"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Danh sách trung tâm bảo hành
                      </Button>
                      <Button
                        variant="link"
                        className="text-red-600 h-auto p-0 justify-start"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Bảo hành tại CellphoneS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-4">Sản phẩm</h3>
                    <div className="space-y-3 mb-4">
                      {order.orderDetails.map((detail) => (
                        <div
                          key={detail.id}
                          className="flex items-start gap-3 pb-3 border-b last:border-0"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center shrink-0">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                              {detail.productVariant
                                ? `SKU: ${detail.productVariant.sku}`
                                : "Sản phẩm"}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">
                              {detail.productVariant?.productVariantValues
                                .map((pv) => pv.variantValue.value)
                                .join(" - ")}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-600">
                                SL: {detail.quantity}
                              </span>
                              {detail.discount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs h-5"
                                >
                                  -{detail.discount}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-semibold text-sm">
                              {formatPrice(detail.finalPrice)}
                            </div>
                            {detail.discount > 0 && (
                              <div className="text-xs text-gray-500 line-through">
                                {formatPrice(detail.price * detail.quantity)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-2 text-sm border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Số lượng sản phẩm:
                        </span>
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
                        <span className="font-semibold text-green-600">
                          Miễn phí
                        </span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-gray-50 rounded-lg p-3 mt-4">
                      <h4 className="font-semibold text-sm mb-2">Thanh toán</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Tổng số tiền</span>
                          <span className="font-bold text-red-600 text-base">
                            {formatPrice(order.finalTotalPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          (Đã bao gồm VAT và được làm tròn)
                        </p>
                        <div className="flex justify-between pt-2">
                          <span className="text-gray-600">
                            Tổng số tiền đã thanh toán
                          </span>
                          <span className="font-semibold">0đ</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          (Đã thanh toán trước)
                        </p>
                        <div className="flex justify-between pt-2 border-t mt-2">
                          <span className="font-semibold">
                            Tổng số tiền còn lại
                          </span>
                          <span className="font-bold text-red-600 text-base">
                            {formatPrice(order.finalTotalPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          (Cần phải thanh toán thêm)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
