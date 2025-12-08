// src/components/Header.tsx
import {
  Newspaper,
  Search,
  ShoppingCart,
  User,
  RefreshCcw,
  Store,
  PackageSearch,
  Phone,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router";
import { cartService } from "@/services/cart.service";
import type { Cart } from "@/types/cart.type";
import { PUBLIC_PATH } from "@/constants/path";
import { Button } from "@/components/ui/button";
import LoginModal from "../LoginModal";

export default function Header() {
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current);
      }
    };
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      if (response.status === 200) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart(null);
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      navigate(`${PUBLIC_PATH.HOME}cart`);
    }
  };

  const handleCartMouseEnter = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setShowCartDropdown(true);
  };

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setShowCartDropdown(false);
    }, 150); // Delay 150ms để người dùng có thời gian di chuyển chuột
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-red-600 to-rose-400 text-white shadow-md py-2">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Banner */}
        <div className="text-white text-sm py-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left Side - Promotional Text */}
            <div className="flex items-center gap-3 flex-wrap">
              <span>Giao hàng nhanh - Miễn phí cho đơn 300k</span>
              <span className="w-1 h-1 bg-white rounded-full"></span>
              <div className="flex items-center gap-1.5">
                <RefreshCcw size={14} />
                <span>Thu cũ giá ngon - Lên đời tiết kiệm</span>
              </div>
            </div>

            {/* Right Side - Utility Links */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="h-4 w-px bg-white/50"></div>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Store size={14} />
                <span>Cửa hàng gần bạn</span>
              </button>
              <div className="h-4 w-px bg-white/50"></div>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <PackageSearch size={14} />
                <span>Tra cứu đơn hàng</span>
              </button>
              <div className="h-4 w-px bg-white/50"></div>
              <a href="tel:18002097" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Phone size={14} />
                <span>1800 2097</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-1 font-bold text-2xl tracking-tighter shrink-0">
            <a href={PUBLIC_PATH.HOME} className="hover:opacity-90 transition-opacity">
              <span className="text-white">CellphoneS</span>
            </a>
          </div>

          {/* Thanh tìm kiếm - Center */}
          <div className="flex-1 max-w-2xl mx-4">
            <form 
              className="flex items-center bg-white rounded-lg px-4 py-2.5 text-gray-700 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('search') as string;
                if (query && query.trim()) {
                  navigate(`${PUBLIC_PATH.HOME}search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
            >
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                type="text"
                name="search"
                placeholder="Bạn muốn mua gì hôm nay?"
                className="flex-1 bg-transparent outline-none ml-3 text-sm placeholder-gray-500 w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Tin tức */}
            <Button 
              variant="ghost"
              className="hidden md:flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg"
              onClick={() => navigate(`${PUBLIC_PATH.HOME}news`)}
            >
              <Newspaper size={20} />
              <span className="text-sm font-medium">Tin tức</span>
            </Button>

            {/* Giỏ hàng */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
                onClick={handleCartClick}
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
              >
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cart && cart.items && cart.items?.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cart.items?.length}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">Giỏ hàng</span>
              </button>

              {/* Cart Dropdown với bridge để tránh mất hover */}
              {showCartDropdown && isAuthenticated && cart && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  onMouseEnter={handleCartMouseEnter}
                  onMouseLeave={handleCartMouseLeave}
                >
                  <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-base">
                      Giỏ hàng của bạn
                    </h3>
                    {cart.items.length === 0 ? (
                      <p className="text-gray-500 text-center py-6">
                        Giỏ hàng trống
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {cart.items.slice(0, 3).map((item) => (
                          <div
                            key={item.productVariantId}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Số lượng: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold text-red-600 mt-1">
                                {item.price.toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                        ))}
                        {cart.items.length > 3 && (
                          <p className="text-xs text-gray-500 text-center py-2">
                            +{cart.items.length - 3} sản phẩm khác
                          </p>
                        )}
                      </div>
                    )}
                    {cart.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">
                            Tổng cộng:
                          </span>
                          <span className="font-bold text-red-600 text-lg">
                            {cart.totalPrice.toLocaleString()}đ
                          </span>
                        </div>
                        <button
                          className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                          onClick={() => {
                            setShowCartDropdown(false);
                            navigate(`${PUBLIC_PATH.HOME}cart`);
                          }}
                        >
                          Xem giỏ hàng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account */}
            {isAuthenticated && user ? (
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg"
                onClick={() => navigate(`${PUBLIC_PATH.HOME}profile`)}
              >
                <User size={20} />
                <div className="text-left">
                  <span className="block text-sm font-semibold leading-tight">
                    {user.fullName}
                  </span>
                  <span className="block text-xs opacity-90">Tài khoản</span>
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg"
                onClick={() => setShowLoginModal(true)}
              >
                <User size={20} />
                <div className="text-left">
                  <span className="block text-sm font-semibold leading-tight">Đăng nhập</span>
                  <span className="block text-xs opacity-90">Đăng ký</span>
                </div>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="sm:hidden text-white hover:bg-white/20 p-2"
              onClick={() => setShowLoginModal(true)}
            >
              <User size={20} />
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </header>
  );
}
