/**
 * Utility để quản lý việc lưu trữ authentication data
 * Kết hợp localStorage (access token, user data) và cookies (refresh token)
 */

import LocalStorageUtil from './localStorage.util';
import CookieUtil from './cookie.util';
import type { UserProfile } from '@/types/auth.type';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

class AuthStorageUtil {
  // Cookie configuration
  private static readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
  private static readonly REFRESH_TOKEN_EXPIRES_DAYS = 7; // 7 ngày

  /**
   * Lưu access token vào localStorage
   */
  static setAccessToken(accessToken: string): void {
    LocalStorageUtil.setAccessToken(accessToken);
  }

  /**
   * Lấy access token từ localStorage
   */
  static getAccessToken(): string | null {
    return LocalStorageUtil.getAccessToken();
  }

  /**
   * Lưu refresh token vào cookie
   */
  static setRefreshToken(refreshToken: string): void {
    CookieUtil.setCookie(
      this.REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      this.REFRESH_TOKEN_EXPIRES_DAYS
    );
  }

  /**
   * Lấy refresh token từ cookie
   */
  static getRefreshToken(): string | null {
    return CookieUtil.getCookie(this.REFRESH_TOKEN_COOKIE_NAME);
  }

  /**
   * Xóa refresh token khỏi cookie
   */
  static removeRefreshToken(): void {
    CookieUtil.deleteCookie(this.REFRESH_TOKEN_COOKIE_NAME);
  }

  /**
   * Lưu thông tin user vào localStorage
   */
  static setUserData(userData: UserProfile): void {
    LocalStorageUtil.setUserData(userData);
  }

  /**
   * Lấy thông tin user từ localStorage
   */
  static getUserData(): UserProfile | null {
    return LocalStorageUtil.getUserData();
  }

  /**
   * Lưu cả tokens và user data
   */
  static setTokensAndData(tokens: TokenData, userData: UserProfile): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
    this.setUserData(userData);
  }

  /**
   * Lưu cả access token và refresh token
   */
  static setTokens(tokens: TokenData): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * Lấy cả access token và refresh token
   */
  static getTokens(): TokenData | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  /**
   * Cập nhật tokens mới (xóa cũ và lưu mới)
   */
  static updateTokens(tokens: TokenData): void {
    this.setTokens(tokens);
  }

  /**
   * Xóa tất cả dữ liệu authentication
   */
  static clearAll(): void {
    LocalStorageUtil.clearAll();
    this.removeRefreshToken();
  }

  /**
   * Kiểm tra có tokens không
   */
  static hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }

  /**
   * Kiểm tra có access token không
   */
  static hasAccessToken(): boolean {
    return LocalStorageUtil.hasAccessToken();
  }

  /**
   * Kiểm tra có user data không
   */
  static hasUserData(): boolean {
    return LocalStorageUtil.hasUserData();
  }

  /**
   * Kiểm tra user đã đăng nhập chưa (có đầy đủ token và data)
   */
  static isAuthenticated(): boolean {
    return this.hasTokens() && this.hasUserData();
  }
}

export default AuthStorageUtil;

