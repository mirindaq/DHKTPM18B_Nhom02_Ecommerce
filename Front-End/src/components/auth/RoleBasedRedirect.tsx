import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@/context/UserContext';
import { ADMIN_PATH, STAFF_PATH, SHIPPER_PATH, PUBLIC_PATH } from '@/constants/path';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * Component xử lý redirect dựa trên role của user
 * Sử dụng khi user truy cập trang chủ hoặc các route không xác định
 */
const RoleBasedRedirect: React.FC = () => {
  const { isAuthenticated, loading, isAdmin, isStaff, isCustomer, isShipper } = useUser();
  const navigate = useNavigate();

  // Memoize redirect path calculation
  const redirectPath = useMemo(() => {
    if (!isAuthenticated) return '/login';
    
    if (isAdmin) return ADMIN_PATH.DASHBOARD;
    if (isStaff) return STAFF_PATH.DASHBOARD;
    if (isShipper) return SHIPPER_PATH.DASHBOARD;
    if (isCustomer) return PUBLIC_PATH.HOME;
    
    return PUBLIC_PATH.HOME; // fallback
  }, [isAuthenticated, isAdmin, isStaff, isShipper, isCustomer]);

  useEffect(() => {
    if (!loading) {
      navigate(redirectPath, { replace: true });
    }
  }, [loading, navigate, redirectPath]);

  // Hiển thị loading trong khi xử lý redirect
  return <LoadingSpinner color="gray" />;
};

export default RoleBasedRedirect;