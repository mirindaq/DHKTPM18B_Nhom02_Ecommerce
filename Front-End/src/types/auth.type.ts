import type { Rank } from "@/types/ranking.type";
import type { ResponseApi } from "./responseApi.type";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  roles: string[];
};

export type UserProfile = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  avatar?: string;
  phone?: string;
  rank?: Rank;
};

export type ProfileResponse = ResponseApi<UserProfile>;

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

export type AuthResponse = ResponseApi<LoginResponse>;
export type RefreshTokenApiResponse = ResponseApi<RefreshTokenResponse>;
