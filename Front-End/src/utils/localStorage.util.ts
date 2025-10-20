/**
 * Utility để quản lý localStorage
 * Chỉ xử lý các thao tác liên quan đến localStorage
 */

import type { UserProfile } from '@/types/auth.type';

class LocalStorageUtil {
  // Keys
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly USER_DATA_KEY = 'userData';

  /**
   * Lưu access token vào localStorage
   */
  static setAccessToken(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  /**
   * Lấy access token từ localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Xóa access token khỏi localStorage
   */
  static removeAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Lưu thông tin user vào localStorage
   */
  static setUserData(userData: UserProfile): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  /**
   * Lấy thông tin user từ localStorage
   */
  static getUserData(): UserProfile | null {
    const data = localStorage.getItem(this.USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Xóa thông tin user khỏi localStorage
   */
  static removeUserData(): void {
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Xóa tất cả dữ liệu khỏi localStorage
   */
  static clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Kiểm tra có access token không
   */
  static hasAccessToken(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Kiểm tra có user data không
   */
  static hasUserData(): boolean {
    return this.getUserData() !== null;
  }
}

export default LocalStorageUtil;
