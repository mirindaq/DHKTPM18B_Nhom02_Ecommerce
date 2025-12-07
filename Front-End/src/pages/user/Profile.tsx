import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate, Outlet, useLocation } from "react-router";
import { PUBLIC_PATH, USER_PATH } from "@/constants/path";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  ShoppingBag,
  Shield,
  Heart,
  User,
  MapPin,
  LogOut,
  Eye,
  EyeOff,
  ChevronDown,
  ShoppingCart,
  Ticket,
  Crown,
  Wrench,
  FileText,
} from "lucide-react";
import Overview from "./Overview";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};


export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [activeSidebarMenu, setActiveSidebarMenu] =
    useState<string>("Tổng quan");

  // useEffect để xử lý active tab khi reload trang ở nested route
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes(USER_PATH.MEMBERSHIP)) {
      setActiveSidebarMenu("Hạng thành viên và ưu đãi");
    } else if (pathname.includes(USER_PATH.WISHLIST)) {
      setActiveSidebarMenu("Danh sách yêu thích");
    } else if (pathname.includes(USER_PATH.ORDERS)) {
      setActiveSidebarMenu("Lịch sử mua hàng");
    } else if (pathname.includes(USER_PATH.ADDRESSES)) {
      setActiveSidebarMenu("Địa chỉ nhận hàng");
    } else if (pathname.includes(USER_PATH.VOUCHERS)) {
      setActiveSidebarMenu("Voucher của tôi");
    } else if (pathname.includes(USER_PATH.EDIT_PROFILE)) {
      setActiveSidebarMenu("Thông tin tài khoản");
    } else if (pathname.includes(USER_PATH.GUARANTEE_POLICY)) {
      setActiveSidebarMenu("Bảo hành & Sửa chữa");
    } else if (pathname.includes(USER_PATH.WARRANTY_POLICY)) {
      setActiveSidebarMenu("Chính sách bảo hành");
    } else if (pathname.includes(USER_PATH.TERMS)) {
      setActiveSidebarMenu("Điều khoản sử dụng");
    } else if (
      pathname === USER_PATH.PROFILE ||
      pathname === `${USER_PATH.PROFILE}/`
    ) {
      // Nếu đang ở route gốc, giữ nguyên default state (overview)
      setActiveSidebarMenu("Tổng quan");
    }
  }, [location.pathname]);

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
    // Navigate về /profile để reset nested route
    if (location.pathname !== USER_PATH.PROFILE) {
      navigate(USER_PATH.PROFILE);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center pt-6">
            <User size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy thông tin người dùng
            </h2>
            <Button onClick={() => navigate(PUBLIC_PATH.HOME)}>
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data - sẽ được thay thế bằng API thực tế
  const totalOrders = 11;
  const totalSpent = 1828000;
  const currentRank = "S-NULL";
  const nextRank = "S-NEW";
  const requiredSpending = 3000000;
  const remainingSpending = requiredSpending - totalSpent;

  // Mask phone number
  const maskPhone = (phone: string | undefined) => {
    if (!phone) return "Chưa cập nhật";
    if (showFullPhone) return phone;
    return phone.substring(0, 4) + "***+" + phone.slice(-2);
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Home size={22} />,
      label: "Tổng quan",
      active: activeSidebarMenu === "Tổng quan",
      onClick: () => handleMenuClick("Tổng quan"),
    },
    {
      icon: <ShoppingBag size={22} />,
      label: "Lịch sử mua hàng",
      active: activeSidebarMenu === "Lịch sử mua hàng",
      onClick: () => {
        setActiveSidebarMenu("Lịch sử mua hàng");
        navigate(USER_PATH.ORDERS);
      },
    },
    {
      icon: <MapPin size={22} />,
      label: "Địa chỉ nhận hàng",
      active: location.pathname.includes(USER_PATH.ADDRESSES),
      onClick: () => {
        setActiveSidebarMenu("Địa chỉ nhận hàng");
        navigate(USER_PATH.ADDRESSES);
      },
    },
    {
      icon: <Heart size={22} />,
      label: "Danh sách yêu thích",
      active: location.pathname.includes(USER_PATH.WISHLIST),
      onClick: () => {
        setActiveSidebarMenu("Danh sách yêu thích");
        navigate(USER_PATH.WISHLIST);
      },
    },
    {
      icon: <Crown size={22} />,
      label: "Hạng thành viên và ưu đãi",
      active: location.pathname.includes(USER_PATH.MEMBERSHIP),
      onClick: () => {
        setActiveSidebarMenu("Hạng thành viên và ưu đãi");
        navigate(USER_PATH.MEMBERSHIP);
      },
    },
    {
      icon: <Ticket size={22} />,
      label: "Voucher của tôi",
      active: location.pathname.includes(USER_PATH.VOUCHERS),
      onClick: () => {
        setActiveSidebarMenu("Voucher của tôi");
        navigate(USER_PATH.VOUCHERS);
      },
    },
    {
      icon: <User size={22} />,
      label: "Thông tin tài khoản",
      active: activeSidebarMenu === "Thông tin tài khoản",
      onClick: () => {
        setActiveSidebarMenu("Thông tin tài khoản");
        navigate(USER_PATH.EDIT_PROFILE);
      },
    },
    {
      icon: <Wrench size={22} />,
      label: "Bảo hành & Sửa chữa",
      active: location.pathname.includes(USER_PATH.GUARANTEE_POLICY),
      onClick: () => {
        setActiveSidebarMenu("Bảo hành & Sửa chữa");
        navigate(USER_PATH.GUARANTEE_POLICY);
      },
    },
    {
      icon: <Shield size={22} />,
      label: "Chính sách bảo hành",
      active: location.pathname.includes(USER_PATH.WARRANTY_POLICY),
      onClick: () => {
        setActiveSidebarMenu("Chính sách bảo hành");
        navigate(USER_PATH.WARRANTY_POLICY);
      },
    },
    {
      icon: <FileText size={22} />,
      label: "Điều khoản sử dụng",
      active: location.pathname.includes(USER_PATH.TERMS),
      onClick: () => {
        setActiveSidebarMenu("Điều khoản sử dụng");
        navigate(USER_PATH.TERMS);
      },
    },
    {
      icon: isLoggingOut ? (
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut size={22} />
      ),
      label: isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất",
      onClick: handleLogout,
    },
  ];


  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white ">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            {/* Left: User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-pink-100 text-red-600 text-2xl">
                  <User size={32} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.fullName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{maskPhone(user.phone)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullPhone(!showFullPhone)}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    {showFullPhone ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              <div className="ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-gray-200 text-gray-700">
                  {currentRank}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  ⏰ Cập nhật lại sau 01/01/2026
                </p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center pr-8">
                <Separator
                  orientation="vertical"
                  className="absolute right-0 h-12"
                />
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart size={20} className="text-red-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {totalOrders}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Tổng số đơn hàng đã mua</p>
              </div>
              <div className="text-center pr-8 relative">
                <Separator
                  orientation="vertical"
                  className="absolute right-0 h-12"
                />
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={20} className="text-red-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {totalSpent.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Tổng tiền tích lũy{" "}
                  <span className="text-red-600">Từ 01/01/2024</span>
                </p>
                <p className="text-xs text-gray-600">
                  Cần chi tiêu thêm{" "}
                  <span className="font-semibold">
                    {remainingSpending.toLocaleString("vi-VN")}đ
                  </span>{" "}
                  để lên hạng <span className="font-semibold">{nextRank}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-2">
                  Bạn đang ở kênh thành viên
                </p>
                <Button
                  variant="outline"
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border-red-200"
                >
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    CellphoneS
                  </span>
                  <ChevronDown size={16} className="text-gray-600 ml-2" />
                </Button>
                <a
                  href="https://cellphones.com.vn"
                  className="text-xs text-blue-600 hover:underline mt-1 block"
                >
                  cellphones.com.vn ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4">
        <div className="grid grid-cols-12 gap-3">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {menuItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={item.onClick}
                    disabled={!item.onClick && !item.active}
                    variant="ghost"
                    className={`
                      w-full justify-start gap-3 rounded-none !text-base !font-medium !py-6 !px-4
                      transition-all duration-200 ease-in-out
                      ${item.active
                        ? "!bg-red-50 !text-red-600 !border-l-4 !border-red-600 hover:!bg-red-100 hover:!text-red-700"
                        : "!text-gray-700 !border-l-4 !border-transparent hover:!bg-gray-100 hover:!text-gray-900 hover:!border-l-4 hover:!border-red-300"
                      }
                      ${!item.onClick && !item.active
                        ? "cursor-not-allowed opacity-50 hover:!bg-transparent hover:!text-gray-700"
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

            {/* App Download Section */}
            <Card className="mt-6 text-center">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Mua sắm dễ dàng - Ưu đãi ngập tràn cùng app CellphoneS
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Tải về trên App Store
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    Tải dụng trên Google Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {location.pathname.startsWith(`${USER_PATH.PROFILE}/`) ? (
              <Card>
                <CardContent className="px-4!">
                  <Outlet />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Overview />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
