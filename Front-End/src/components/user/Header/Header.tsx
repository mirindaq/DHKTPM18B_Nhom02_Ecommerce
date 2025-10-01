// src/components/Header.tsx
import { Menu, MapPin, Search, ShoppingCart, User } from "lucide-react";

export default function Header() {
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
        <button className="flex items-center space-x-1 hover:text-yellow-300">
          <ShoppingCart size={20} />
          <span>Giỏ hàng</span>
        </button>

        {/* User */}
        <button className="flex items-center space-x-1 bg-red-500 hover:bg-red-400 px-3 py-2 rounded-lg">
          <User size={20} />
          <span>Hùng</span>
        </button>
      </div>
    </header>
  );
}
