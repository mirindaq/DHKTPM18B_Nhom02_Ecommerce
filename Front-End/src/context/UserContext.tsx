import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { UserProfile } from '@/types/auth.type';
import LocalStorageUtil from '@/utils/localStorage.util';

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
  SHIPPER: 'SHIPPER'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  isShipper: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true

  const isAuthenticated = !!user;
  
  // Memoize role checks for better performance
  const hasRole = React.useCallback((role: Role): boolean => {
    return user?.roles?.includes(role) ?? false;
  }, [user?.roles]);

  const hasAnyRole = React.useCallback((roles: Role[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  // Memoize individual role checks
  const isAdmin = React.useMemo(() => hasRole(ROLES.ADMIN), [hasRole]);
  const isStaff = React.useMemo(() => hasRole(ROLES.STAFF), [hasRole]);
  const isCustomer = React.useMemo(() => hasRole(ROLES.CUSTOMER), [hasRole]);
  const isShipper = React.useMemo(() => hasRole(ROLES.SHIPPER), [hasRole]);

  const login = React.useCallback((userData: UserProfile) => {
    setUser(userData);
    LocalStorageUtil.setUserData(userData);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
      setUser(null);
      LocalStorageUtil.clearAllData();
    }
  }, []);

  const refreshProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.data.status === 200) {
        setUser(response.data.data);
        LocalStorageUtil.setUserData(response.data.data);
      }
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = LocalStorageUtil.getUserData();
        const accessToken = LocalStorageUtil.getAccessToken();
        console.log('UserContext - Loading user:', { userData, hasAccessToken: !!accessToken });

        if (userData && accessToken) {
          setUser(userData);
          console.log('UserContext - User loaded successfully:', userData.roles);
        } else {
          // Clear invalid data
          console.log('UserContext - Invalid data, clearing...');
          setUser(null);
          LocalStorageUtil.clearAllData();
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        LocalStorageUtil.clearAllData();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value: UserContextType = React.useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    isCustomer,
    isShipper,
    login,
    logout,
    refreshProfile
  }), [
    user,
    loading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    isCustomer,
    isShipper,
    login,
    logout,
    refreshProfile
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
