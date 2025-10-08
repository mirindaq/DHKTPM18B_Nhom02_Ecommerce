/**
 * Utility để quản lý localStorage với 1 access token và 1 refresh token duy nhất
 * Không phân biệt user/admin, chỉ lưu token hiện tại
 */

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

import type { UserProfile } from '@/types/auth.type';

class LocalStorageUtil {
  // Keys cho token duy nhất
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_DATA_KEY = 'userData';

  /**
   * Lưu token
   */
  static setTokens(tokens: TokenData): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  /**
   * Lấy access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Lấy refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Lưu thông tin user
   */
  static setUserData(userData: UserProfile): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  /**
   * Lấy thông tin user
   */
  static getUserData(): UserProfile | null {
    const data = localStorage.getItem(this.USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Xóa tất cả token và data
   */
  static clearAllData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Kiểm tra có token không
   */
  static hasToken(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Kiểm tra có data không
   */
  static hasData(): boolean {
    return this.getUserData() !== null;
  }

  /**
   * Lưu token và data
   */
  static setTokensAndData(tokens: TokenData, data: UserProfile): void {
    this.setTokens(tokens);
    this.setUserData(data);
  }

  /**
   * Xóa token cũ và lưu token mới
   */
  static updateTokens(tokens: TokenData): void {
    this.clearAllData();
    this.setTokens(tokens);
  }
}

export default LocalStorageUtil;
