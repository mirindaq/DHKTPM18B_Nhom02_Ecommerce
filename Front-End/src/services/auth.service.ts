
import axiosClient from '@/configurations/axios.config';
import type {
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  RefreshTokenApiResponse
} from '@/types/auth.type';

export const authService = {
  login: async (request: LoginRequest) => {
    const response = await axiosClient.post<AuthResponse>('/auth/admin/login', request);
    return response;
  },

  refreshToken: async (request: RefreshTokenRequest) => {
    const response = await axiosClient.post<RefreshTokenApiResponse>('/auth/refresh-token', request);
    return response;
  }
};
