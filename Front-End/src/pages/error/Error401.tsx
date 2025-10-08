import React from 'react';
import { Link } from 'react-router';
import { AUTH_PATH, PUBLIC_PATH } from '@/constants/path';

const Error401: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản phù hợp.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            to={AUTH_PATH.LOGIN_USER}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 inline-block"
          >
            Đăng nhập User
          </Link>
          
          <Link
            to={AUTH_PATH.LOGIN_ADMIN}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200 inline-block"
          >
            Đăng nhập Admin
          </Link>
          
          <Link
            to={PUBLIC_PATH.HOME}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 inline-block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error401;
