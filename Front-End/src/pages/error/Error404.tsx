import { Link } from 'react-router';
import { Home, Search, AlertCircle } from 'lucide-react';
import { PUBLIC_PATH } from '@/constants/path';

export default function Error404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-red-600 leading-none mb-4">
            404
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Trang không tìm thấy
              </h2>
              <p className="text-lg text-gray-600">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
              </p>
            </div>
          </div>
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
              <AlertCircle className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={PUBLIC_PATH.HOME}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
          
          <Link
            to={PUBLIC_PATH.SEARCH_PAGE}
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            Tìm kiếm sản phẩm
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Hoặc bạn có thể:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to={PUBLIC_PATH.PRODUCTS}
              className="text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Xem sản phẩm
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to={PUBLIC_PATH.NEWS}
              className="text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Đọc tin tức
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to={PUBLIC_PATH.MEMBERSHIP}
              className="text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Tìm hiểu về Smember
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
