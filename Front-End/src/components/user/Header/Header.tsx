// src/components/Header.tsx
import {
  Menu,
  MapPin,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user]);

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


  // Shared button style for consistency
  const redButtonStyle =
    "flex items-center space-x-1 bg-[#AC0014] hover:bg-red-700 px-3 py-2 rounded-lg text-sm";

  return (
    <header className="bg-[#D70018] text-white py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 space-x-4">
        {/* Logo */}
        <div className="flex items-center space-x-1 font-bold text-2xl tracking-tighter">
          <span className="text-white">CellphoneS</span>
        </div>

        {/* Danh mục */}
        <Button className={redButtonStyle}>
          <Menu size={18} />
          <span>Danh mục</span>
        </Button>

        {/* Chọn địa điểm */}
        <Button className={redButtonStyle}>
          <MapPin size={18} />
          <span>Xem giá tại Miền...</span>
          <ChevronDown size={16} />
        </Button>

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 text-gray-700">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Bạn muốn mua gì hôm nay?"
              className="flex-1 bg-transparent outline-none ml-2 text-sm placeholder-gray-500"
            />
          </div>
        </div>

        {/* Giỏ hàng */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-2 py-1 hover:bg-[#AC0014] rounded-lg"
            onClick={handleCartClick}
            onMouseEnter={() => setShowCartDropdown(true)}
            onMouseLeave={() => setShowCartDropdown(false)}
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {cart && cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-yellow-400 text-red-600 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.items.length}
                </span>
              )}
            </div>
            <span className="text-sm">Giỏ hàng</span>
          </button>

          {/* Cart Dropdown Logic remains the same */}
          {showCartDropdown && isAuthenticated && cart && (
            <div
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
              onMouseEnter={() => setShowCartDropdown(true)}
              onMouseLeave={() => setShowCartDropdown(false)}
            >
              {/* ... Nội dung dropdown giữ nguyên ... */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Giỏ hàng của bạn</h3>
                {cart.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Giỏ hàng trống</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.items.slice(0, 3).map((item) => (
                      <div key={item.productVariantId} className="flex items-center space-x-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                          <p className="text-sm font-semibold text-red-600">
                            {item.price.toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    ))}
                    {cart.items.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{cart.items.length - 3} sản phẩm khác
                      </p>
                    )}
                  </div>
                )}
                {cart.items.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="font-bold text-red-600 text-lg">
                        {cart.totalPrice.toLocaleString()}đ
                      </span>
                    </div>
                    <button
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
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
          <button
            className={`${redButtonStyle} space-x-2`}
            onClick={() => navigate(`${PUBLIC_PATH.HOME}profile`)}
          >
            <User size={24} />
            <div className="text-left">
              <span className="block text-sm font-semibold">{user.name}</span>
              <span className="block text-xs">Tài khoản</span>
            </div>
          </button>
        ) : (
          <button
            className={`${redButtonStyle} space-x-2`}
            onClick={() => setShowLoginModal(true)}
          >
            <User size={24} />
            <div className="text-left">
              <span className="block text-sm font-semibold">Đăng nhập</span>
              <span className="block text-xs">Đăng ký</span>
            </div>
          </button>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </header>
  );
}