// src/components/Header.tsx
import { Menu, MapPin, Search, ShoppingCart, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router";
import { cartService } from "@/services/cart.service";
import type { Cart } from "@/types/cart.type";
import { AUTH_PATH, PUBLIC_PATH } from "@/constants/path";

export default function Header() {
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);

  // Load cart data when user is authenticated
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

  const handleLoginClick = () => {
    setShowLoginModal(false);
    navigate(AUTH_PATH.LOGIN_USER);
  };

  const handleRegisterClick = () => {
    setShowLoginModal(false);
    navigate(AUTH_PATH.REGISTER_USER);
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 space-x-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 font-bold text-2xl">
          <span className="text-white">cellphone</span>
          <span className="bg-white text-red-600 px-1 rounded">S</span>
        </div>

        {/* Danh mục */}
        <button className="flex items-center space-x-1 bg-red-500 hover:bg-red-400 px-3 py-2 rounded-lg">
          <Menu size={18} />
          <span>Danh mục</span>
        </button>

        {/* Chọn địa điểm */}
        <button className="flex items-center space-x-1 bg-red-500 hover:bg-red-400 px-3 py-2 rounded-lg">
          <MapPin size={18} />
          <span>Hồ Chí Minh</span>
        </button>

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-lg">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 text-gray-700">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Bạn muốn mua gì hôm nay?"
              className="flex-1 bg-transparent outline-none ml-2 text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Giỏ hàng */}
        <div className="relative">
          <button 
            className="flex items-center space-x-1 hover:text-yellow-300"
            onClick={handleCartClick}
            onMouseEnter={() => setShowCartDropdown(true)}
            onMouseLeave={() => setShowCartDropdown(false)}
          >
            <ShoppingCart size={20} />
            <span>Giỏ hàng</span>
            {cart && cart.items.length > 0 && (
              <span className="bg-yellow-400 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cart.items.length}
              </span>
            )}
          </button>

          {/* Cart Dropdown */}
          {showCartDropdown && isAuthenticated && cart && (
            <div 
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
              onMouseEnter={() => setShowCartDropdown(true)}
              onMouseLeave={() => setShowCartDropdown(false)}
            >
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

        {/* User */}
        {isAuthenticated && user ? (
          <button 
            className="flex items-center space-x-1 bg-red-500 hover:bg-red-400 px-3 py-2 rounded-lg"
            onClick={() => navigate(`${PUBLIC_PATH.HOME}profile`)}
          >
            <User size={20} />
            <span>{user.name}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-400 px-3 py-2 rounded-lg"
              onClick={() => navigate(AUTH_PATH.LOGIN_USER)}
            >
              <User size={20} />
              <span>Đăng nhập</span>
            </button>
            <button 
              className="flex items-center space-x-1 bg-white text-red-600 hover:bg-gray-100 px-3 py-2 rounded-lg border border-red-600"
              onClick={() => navigate(AUTH_PATH.REGISTER_USER)}
            >
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Smember</h2>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-red-600" />
              </div>
              <p className="text-gray-600">
                Vui lòng đăng nhập tài khoản Smember để xem ưu đãi và thanh toán dễ dàng hơn.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleRegisterClick}
                className="w-full bg-white text-red-600 border-2 border-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors"
              >
                Đăng ký
              </button>
              <button
                onClick={handleLoginClick}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
