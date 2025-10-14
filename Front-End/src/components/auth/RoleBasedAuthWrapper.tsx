import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useUser } from '@/context/UserContext';
import { ADMIN_PATH, STAFF_PATH, SHIPPER_PATH, PUBLIC_PATH, AUTH_PATH } from '@/constants/path';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface RoleBasedAuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Component xử lý logic logout tự động khi role không phù hợp với trang hiện tại
 * và redirect khi đã đăng nhập với role phù hợp với trang login
 */
const RoleBasedAuthWrapper: React.FC<RoleBasedAuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, loading, user, isAdmin, isStaff, isCustomer, isShipper, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Logic để logout khi role không phù hợp với trang hiện tại
  const shouldLogout = useMemo(() => {
    if (loading || !isAuthenticated || !user) return false;
    
    const isOnUserPages = location.pathname.startsWith('/') && 
                          !location.pathname.startsWith('/admin') && 
                          !location.pathname.startsWith('/staff') && 
                          !location.pathname.startsWith('/shipper') &&
                          location.pathname !== AUTH_PATH.LOGIN_ADMIN &&
                          location.pathname !== AUTH_PATH.LOGIN_USER;
    
    const isOnAdminPages = location.pathname.startsWith('/admin') || 
                           location.pathname.startsWith('/staff') || 
                           location.pathname.startsWith('/shipper') ||
                           location.pathname === AUTH_PATH.LOGIN_ADMIN;
    
    // Nếu đang ở trang user nhưng đã đăng nhập với role admin/staff/shipper
    if (isOnUserPages && (isAdmin || isStaff || isShipper)) {
      return true;
    }
    
    // Nếu đang ở trang admin nhưng đã đăng nhập với role customer
    if (isOnAdminPages && isCustomer) {
      return true;
    }
    
    return false;
  }, [loading, isAuthenticated, user, isAdmin, isStaff, isShipper, isCustomer, location.pathname]);

  // Logic để redirect khi đã đăng nhập với role phù hợp với trang login
  const shouldRedirect = useMemo(() => {
    if (loading) return false;
    
    const isOnAdminLogin = location.pathname === AUTH_PATH.LOGIN_ADMIN;
    const isOnUserLogin = location.pathname === AUTH_PATH.LOGIN_USER;
    
    // Chỉ redirect khi đã đăng nhập và role phù hợp với trang login
    if (isAuthenticated && user) {
      if ((isOnAdminLogin && (isAdmin || isStaff || isShipper)) || 
          (isOnUserLogin && isCustomer)) {
        return true;
      }
    }
    
    return false;
  }, [loading, isAuthenticated, user, isAdmin, isStaff, isShipper, isCustomer, location.pathname]);

  // Get redirect path based on user role
  const getRedirectPath = (): string => {
    const isOnAdminLogin = location.pathname === AUTH_PATH.LOGIN_ADMIN;
    const isOnUserLogin = location.pathname === AUTH_PATH.LOGIN_USER;
    
    if (isOnAdminLogin && (isAdmin || isStaff || isShipper)) {
      if (isAdmin) return ADMIN_PATH.DASHBOARD;
      if (isStaff) return STAFF_PATH.DASHBOARD;
      if (isShipper) return SHIPPER_PATH.DASHBOARD;
    }
    if (isOnUserLogin && isCustomer) {
      return PUBLIC_PATH.HOME;
    }
    
    return PUBLIC_PATH.HOME;
  };

  useEffect(() => {
    if (shouldLogout) {
      console.log('RoleBasedAuthWrapper - Logging out due to role mismatch');
      logout().catch(console.error);
    }
  }, [shouldLogout, logout]);

  useEffect(() => {
    if (shouldRedirect) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [shouldRedirect, navigate, isAdmin, isStaff, isShipper, isCustomer, location.pathname]);

  // Show loading during logout or redirect
  if (loading || shouldLogout || shouldRedirect) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default RoleBasedAuthWrapper;
