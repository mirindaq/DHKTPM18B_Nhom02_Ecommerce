import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router';
import { PUBLIC_PATH } from '@/constants/path';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, LogOut, Edit, Shield } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // UserContext đã xử lý API logout
      await logout();
      // Chuyển về trang chủ
      navigate(PUBLIC_PATH.HOME);
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn chuyển về trang chủ dù có lỗi
      navigate(PUBLIC_PATH.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin người dùng</h2>
          <Button onClick={() => navigate(PUBLIC_PATH.HOME)}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <Button
              variant="outline"
              onClick={() => navigate(PUBLIC_PATH.HOME)}
            >
              Về trang chủ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={40} className="text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Shield size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {user.roles?.map(role => {
                      const roleNames = {
                        'ADMIN': 'Quản trị viên',
                        'STAFF': 'Nhân viên',
                        'CUSTOMER': 'Khách hàng',
                        'SHIPPER': 'Shipper'
                      };
                      return roleNames[role as keyof typeof roleNames] || role;
                    }).join(', ')}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang đăng xuất...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Thông tin chi tiết</h3>
                <Button variant="outline" size="sm">
                  <Edit size={16} className="mr-2" />
                  Chỉnh sửa
                </Button>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Phone size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{user.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ID người dùng</p>
                    <p className="font-medium text-gray-900">
                      {user.id || 'Không xác định'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                  onClick={() => navigate(`${PUBLIC_PATH.HOME}cart`)}
                >
                  <User size={24} className="text-blue-600" />
                  <span>Giỏ hàng</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2"
                  onClick={() => navigate(`${PUBLIC_PATH.HOME}orders`)}
                >
                  <Shield size={24} className="text-green-600" />
                  <span>Đơn hàng</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
