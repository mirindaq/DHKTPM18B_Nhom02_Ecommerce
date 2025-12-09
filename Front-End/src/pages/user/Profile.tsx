import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate, Outlet, useLocation } from "react-router";
import { PUBLIC_PATH, USER_PATH } from "@/constants/path";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
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
  ShoppingCart,
  Ticket,
  Crown,
  Wrench,
  FileText,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { rankingService } from "@/services/ranking.service";
import { useQuery } from "@/hooks";
import Overview from "./Overview";
import type { OrderListResponse } from "@/types/order.type";
import type { RankResponse, Rank } from "@/types/ranking.type";

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

  // Fetch orders để tính tổng số đơn và tổng tiền
  const {
    data: ordersData,
    isLoading: loadingOrders,
  } = useQuery<OrderListResponse>(
    () => orderService.getMyOrders(1, 1000), // Lấy tất cả orders để tính tổng
    {
      queryKey: ["my-orders", "profile-stats"],
    }
  );

  // Fetch ranks để tính next rank
  const {
    data: ranksData,
    isLoading: loadingRanks,
  } = useQuery<RankResponse>(
    () => rankingService.getAllRankings(),
    {
      queryKey: ["ranks", "all"],
    }
  );

  // Lấy rank hiện tại từ API (dựa trên tổng tiền tích lũy từ đơn hàng COMPLETED)
  const {
    data: myRankData,
    isLoading: loadingMyRank,
  } = useQuery<{ status: number; message: string; data: Rank }>(
    () => rankingService.getMyRank(),
    {
      queryKey: ["my-rank", "profile"],
    }
  );

  // Tính toán thống kê
  const orders = ordersData?.data?.data || [];
  const totalOrders = orders.length;
  // Chỉ tính tổng tiền tích lũy từ các đơn hàng đã hoàn thành
  const totalSpent = orders
    .filter(order => order.status === "COMPLETED")
    .reduce((sum, order) => sum + (order.finalTotalPrice || 0), 0);
  
  // Lấy rank hiện tại từ API getMyRank, fallback về user.rank nếu chưa có
  const ranks = ranksData?.data || [];
  const sortedRanks = [...ranks].sort((a, b) => a.minSpending - b.minSpending);
  
  let currentRankObj: Rank | undefined = myRankData?.data;
  if (!currentRankObj && user?.rank?.name) {
    // Fallback: tìm rank theo name từ user.rank
    currentRankObj = sortedRanks.find(r => r.name === user.rank?.name);
  }
  
  const currentRank = currentRankObj?.name || user?.rank?.name || "MEMBER";
  const currentRankIndex = sortedRanks.findIndex(r => r.id === currentRankObj?.id || r.name === currentRank);
  const nextRank = currentRankIndex >= 0 && currentRankIndex < sortedRanks.length - 1 
    ? sortedRanks[currentRankIndex + 1] 
    : null;
  const requiredSpending = nextRank ? nextRank.minSpending : 0;
  const remainingSpending = Math.max(0, requiredSpending - totalSpent);

  const isLoadingStats = loadingOrders || loadingRanks || loadingMyRank;

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
          <div className="flex items-center justify-between my-5">
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
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-red-50 text-red-600">
                  {currentRank}
                </span>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-start gap-8">
              <div className="text-center pr-8 relative">
                <Separator
                  orientation="vertical"
                  className="absolute right-0 top-0 h-full"
                />
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-16">
                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart size={20} className="text-red-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {totalOrders}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 whitespace-nowrap">Tổng số đơn hàng đã mua</p>
                  </div>
                )}
              </div>
              <div className="text-center pr-8 relative">
                <Separator
                  orientation="vertical"
                  className="absolute right-0 top-0 h-full"
                />
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-16">
                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket size={20} className="text-red-600" />
                      <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                        {totalSpent.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 whitespace-nowrap">
                      Tổng tiền tích lũy
                    </p>
                    {nextRank && remainingSpending > 0 && (
                      <p className="text-xs text-gray-600 mt-1 text-center max-w-[200px]">
                        Cần chi tiêu thêm{" "}
                        <span className="font-semibold text-red-600">
                          {remainingSpending.toLocaleString("vi-VN")}đ
                        </span>{" "}
                        để lên hạng <span className="font-semibold">{nextRank.name}</span>
                      </p>
                    )}
                  </div>
                )}
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
