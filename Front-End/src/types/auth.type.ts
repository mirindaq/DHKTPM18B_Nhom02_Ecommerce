import type { ResponseApi } from "./responseApi.type";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  roles: string[];
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

export type AuthResponse = ResponseApi<LoginResponse>;
export type RefreshTokenApiResponse = ResponseApi<RefreshTokenResponse>;
