import React from 'react';
import { useUser, ROLES } from '@/context/UserContext';

const UserRoleDisplay: React.FC = () => {
  const { user, isAdmin, isStaff, isShipper, isUser, logout } = useUser();

  if (!user) return null;

  const getRoleDisplay = () => {
    if (isAdmin) return { text: 'Admin', color: 'bg-red-500', textColor: 'text-red-700' };
    if (isStaff) return { text: 'Staff', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (isShipper) return { text: 'Shipper', color: 'bg-green-500', textColor: 'text-green-700' };
    if (isUser) return { text: 'User', color: 'bg-gray-500', textColor: 'text-gray-700' };
    return { text: 'Unknown', color: 'bg-gray-500', textColor: 'text-gray-700' };
  };

  const roleInfo = getRoleDisplay();

  return (
    <div className="flex items-center space-x-4">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <div className={`h-8 w-8 rounded-full ${roleInfo.color} flex items-center justify-center`}>
          <span className="text-white text-sm font-medium">
            {user.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name}
        </p>
        <p className={`text-xs ${roleInfo.textColor} font-medium`}>
          {roleInfo.text}
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        title="Đăng xuất"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default UserRoleDisplay;
