import { Link } from 'react-router';
import { Lock, Home, LogIn, Shield } from 'lucide-react';
import { AUTH_PATH, PUBLIC_PATH } from '@/constants/path';

const Error401: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-red-600 leading-none mb-4">
            401
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Truy cập bị từ chối
              </h2>
              <p className="text-lg text-gray-600">
                Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản phù hợp.
              </p>
            </div>
          </div>
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
              <Lock className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            to={AUTH_PATH.LOGIN_USER}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <LogIn className="w-5 h-5" />
            Đăng nhập User
          </Link>
          
          <Link
            to={AUTH_PATH.LOGIN_ADMIN}
            className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Shield className="w-5 h-5" />
            Đăng nhập Admin
          </Link>
        </div>

        {/* Secondary Action */}
        <div className="pt-8 border-t border-gray-200">
          <Link
            to={PUBLIC_PATH.HOME}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error401;
