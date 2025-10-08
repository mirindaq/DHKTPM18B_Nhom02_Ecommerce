import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useUser, ROLES, type Role } from '@/context/UserContext';
import { AUTH_PATH } from '@/constants/path';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/error-401'
}) => {
  const { isAuthenticated, loading, hasAnyRole } = useUser();
  const location = useLocation();
  
  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={AUTH_PATH.LOGIN_USER} state={{ from: location }} replace />;
  }

  // No role requirements - allow access
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Check role access
  const hasAccess = hasAnyRole(requiredRoles);
  
  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Optimized role-based route components
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>{children}</ProtectedRoute>
);

export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.STAFF]}>{children}</ProtectedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.CUSTOMER]}>{children}</ProtectedRoute>
);

export const ShipperRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.SHIPPER]}>{children}</ProtectedRoute>
);

export const AdminOrStaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.STAFF]}>{children}</ProtectedRoute>
);

export const AdminOrStaffOrShipperRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.STAFF, ROLES.SHIPPER]}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
