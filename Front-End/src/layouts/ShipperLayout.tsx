import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useUser } from '@/context/UserContext';
import { SHIPPER_PATH } from '@/constants/path';

const ShipperLayout: React.FC = () => {
  const { user, logout } = useUser();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: SHIPPER_PATH.DASHBOARD, icon: '📊' },
    { name: 'Đơn hàng', href: SHIPPER_PATH.ORDERS, icon: '📋' },
    { name: 'Giao hàng', href: SHIPPER_PATH.DELIVERIES, icon: '🚚' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-900">Shipper Panel</h1>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.href
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Shipper</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full text-left text-sm text-red-600 hover:text-red-800"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShipperLayout;
