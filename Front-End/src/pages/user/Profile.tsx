import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router';
import { PUBLIC_PATH } from '@/constants/path';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ShoppingBag, 
  Shield, 
  Heart, 
  User, 
  MapPin, 
  Search, 
  MessageSquare, 
  Book, 
  LogOut,
  Eye,
  EyeOff,
  ChevronDown,
  ShoppingCart,
  Ticket,
  GraduationCap,
  Link as LinkIcon
} from 'lucide-react';

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type TabType = 'membership' | 'overview' | 'orders' | 'addresses' | 'account' | 'vouchers' | 'student';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('membership');
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<string>('Hạng thành viên và ưu đãi');

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate(PUBLIC_PATH.HOME);
    } catch (error) {
      console.error('Logout error:', error);
      navigate(PUBLIC_PATH.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMenuClick = (label: string, tab?: TabType) => {
    setActiveSidebarMenu(label);
    if (tab) {
      setActiveTab(tab);
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

  // Mock data - sẽ được thay thế bằng API thực tế
  const totalOrders = 11;
  const totalSpent = 1828000;
  const currentRank = 'S-NULL';
  const nextRank = 'S-NEW';
  const requiredSpending = 3000000;
  const remainingSpending = requiredSpending - totalSpent;

  // Mask phone number
  const maskPhone = (phone: string | undefined) => {
    if (!phone) return 'Chưa cập nhật';
    if (showFullPhone) return phone;
    return phone.substring(0, 4) + '***+' + phone.slice(-2);
  };

  const menuItems: MenuItem[] = [
    { icon: <Home size={20} />, label: 'Tổng quan', onClick: () => handleMenuClick('Tổng quan', 'overview') },
    { icon: <ShoppingBag size={20} />, label: 'Lịch sử mua hàng', onClick: () => handleMenuClick('Lịch sử mua hàng', 'orders') },
    { icon: <Search size={20} />, label: 'Tra cứu bảo hành' },
    { 
      icon: <Heart size={20} />, 
      label: 'Hạng thành viên và ưu đãi', 
      active: activeSidebarMenu === 'Hạng thành viên và ưu đãi',
      onClick: () => handleMenuClick('Hạng thành viên và ưu đãi', 'membership')
    },
    { icon: <GraduationCap size={20} />, label: 'Ưu đãi S-Student và S-Teacher', onClick: () => handleMenuClick('Ưu đãi S-Student và S-Teacher', 'student') },
    { icon: <User size={20} />, label: 'Thông tin tài khoản', onClick: () => handleMenuClick('Thông tin tài khoản', 'account') },
    { icon: <MapPin size={20} />, label: 'Tìm kiếm cửa hàng' },
    { icon: <Shield size={20} />, label: 'Chính sách bảo hành' },
    { icon: <MessageSquare size={20} />, label: 'Góp ý - Phản hồi - Hỗ trợ' },
    { icon: <Book size={20} />, label: 'Điều khoản sử dụng' },
    { 
      icon: isLoggingOut ? <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : <LogOut size={20} />, 
      label: isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất', 
      onClick: handleLogout 
    },
  ];

  // Render content for Membership tab
  const renderMembershipContent = () => (
    <>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Ưu đãi của bạn</h3>
      
      {/* Empty State */}
      <div className="text-center py-12">
        <div className="w-32 h-32 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
          <Heart size={48} className="text-red-400" />
        </div>
        <p className="text-gray-600">Bạn đang chưa có ưu đãi nào</p>
      </div>

      {/* Rank Cards Preview */}
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-4">
          {/* S-NULL Card */}
          <div className="bg-gray-100 rounded-lg p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-800">S-NULL</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <User size={16} className="inline mr-1" />
              {user.name}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Đã mua <span className="font-bold">{totalSpent.toLocaleString('vi-VN')}đ</span>/{requiredSpending.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Hạng thành viên được cập nhật lại sau 01/01/2026
            </div>
            <div className="text-xs text-gray-600">
              Cần chi tiêu thêm <span className="font-bold">{remainingSpending.toLocaleString('vi-VN')}đ</span> để lên hạng <span className="font-bold">{nextRank}</span>
            </div>
          </div>

          {/* S-NEW Card */}
          <div className="bg-orange-100 rounded-lg p-6 relative opacity-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-orange-800">S-NEW</span>
              <Shield size={20} className="text-orange-400" />
            </div>
            <p className="text-sm text-orange-700">🔒 Chưa mở khóa hạng thành viên</p>
          </div>

          {/* S-MEM Card */}
          <div className="bg-yellow-100 rounded-lg p-6 relative opacity-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-yellow-800">S-MEM</span>
              <Shield size={20} className="text-yellow-400" />
            </div>
            <p className="text-sm text-yellow-700">🔒 Chưa mở khóa hạng thành viên</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">S-NULL</span>
            <span className="text-sm font-semibold text-gray-400">S-NEW</span>
            <span className="text-sm font-semibold text-gray-400">S-MEM</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute h-2 bg-red-600 rounded-full transition-all duration-300"
              style={{ width: `${(totalSpent / requiredSpending) * 33.33}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center -mt-5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded-full -mt-5" />
            <div className="w-6 h-6 bg-gray-300 rounded-full -mt-5" />
          </div>
        </div>
      </div>

      {/* Conditions Section */}
      <div className="mt-8 p-4 bg-red-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">ĐIỀU KIỆN THĂNG CẤP</h4>
        <p className="text-sm text-gray-700">
          <Heart size={16} className="inline text-red-600 mr-1" />
          Tổng số tiền mua hàng tích lũy trong năm nay và năm liền trước đạt từ 0 đến 3 triệu đồng, không tính đơn hàng doanh nghiệp B2B
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">ƯU ĐÃI MUA HÀNG</h4>
        <p className="text-sm text-gray-700">
          🎁 Hiện chưa có ưu đãi mua hàng đặc biệt cho hạng thành viên {currentRank}
        </p>
      </div>

      {/* Policy Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">CHÍNH SÁCH PHỤC VỤ</h4>
        <p className="text-sm text-gray-700">
          🔒 Hiện chưa có chính sách ưu đãi phục vụ đặc biệt cho hạng thành viên {currentRank}
        </p>
      </div>
    </>
  );

  // Render content for other tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'membership':
        return renderMembershipContent();
      case 'overview':
        return (
          <div className="text-center py-12">
            <Home size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tổng quan</h3>
            <p className="text-gray-600">Nội dung tổng quan đang được phát triển</p>
          </div>
        );
      case 'orders':
        return (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lịch sử mua hàng</h3>
            <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
          </div>
        );
      case 'addresses':
        return (
          <div className="text-center py-12">
            <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Địa chỉ nhận hàng</h3>
            <p className="text-gray-600">Bạn chưa có địa chỉ nào</p>
          </div>
        );
      case 'account':
        return (
          <div className="text-center py-12">
            <User size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thông tin tài khoản</h3>
            <p className="text-gray-600">Nội dung thông tin tài khoản đang được phát triển</p>
          </div>
        );
      case 'vouchers':
        return (
          <div className="text-center py-12">
            <Ticket size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mã giảm giá</h3>
            <p className="text-gray-600">Bạn chưa có mã giảm giá nào</p>
          </div>
        );
      case 'student':
        return (
          <div className="text-center py-12">
            <GraduationCap size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">S-Student & S-Teacher</h3>
            <p className="text-gray-600">Chương trình ưu đãi dành cho sinh viên và giáo viên</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            {/* Left: User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{maskPhone(user.phone)}</span>
                  <button 
                    onClick={() => setShowFullPhone(!showFullPhone)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showFullPhone ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="ml-4">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-sm font-semibold rounded">
                  {currentRank}
                  </span>
                <p className="text-xs text-gray-500 mt-1">
                  ⏰ Cập nhật lại sau 01/01/2026
                </p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center border-r border-gray-200 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart size={20} className="text-red-600" />
                  <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
                </div>
                <p className="text-xs text-gray-600">Tổng số đơn hàng đã mua</p>
              </div>
              <div className="text-center border-r border-gray-200 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={20} className="text-red-600" />
                  <span className="text-2xl font-bold text-gray-900">{totalSpent.toLocaleString('vi-VN')}đ</span>
                </div>
                <p className="text-xs text-gray-600">Tổng tiền tích lũy <span className="text-red-600">Từ 01/01/2024</span></p>
                <p className="text-xs text-gray-600">Cần chi tiêu thêm <span className="font-semibold">{remainingSpending.toLocaleString('vi-VN')}đ</span> để lên hạng <span className="font-semibold">{nextRank}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-2">Bạn đang ở kênh thành viên</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <span className="font-semibold text-gray-900">CellphoneS</span>
                  <ChevronDown size={16} className="text-gray-600" />
                </div>
                <a href="https://cellphones.com.vn" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                  cellphones.com.vn ↗
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-t border-gray-200 pt-4">
            <button 
              onClick={() => setActiveTab('membership')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'membership' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              <Heart size={18} />
              <span>Hạng thành viên</span>
            </button>
            <button 
              onClick={() => setActiveTab('vouchers')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'vouchers' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              <Ticket size={18} />
              <span>Mã giảm giá</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'orders' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              <ShoppingBag size={18} />
              <span>Lịch sử mua hàng</span>
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'addresses' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              <MapPin size={18} />
              <span>Số địa chỉ</span>
            </button>
            <button 
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'student' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              <GraduationCap size={18} />
              <span>S-Student & S-Teacher</span>
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'account' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              <LinkIcon size={18} />
              <span>Liên kết tài khoản</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  disabled={!item.onClick && !item.active}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                    ${item.active 
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-600' 
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }
                    ${!item.onClick && !item.active ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* App Download Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6 text-center">
              <p className="text-sm text-gray-700 mb-3">Mua sắm dễ dàng - Ưu đãi ngập tràn cùng app CellphoneS</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                    </div>
                <Button variant="outline" size="sm" className="w-full">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Tải về trên App Store
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  Tải dụng trên Google Play
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
