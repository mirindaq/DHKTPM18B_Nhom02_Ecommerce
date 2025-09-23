
import axiosClient from '@/configurations/axios.config';
import type {
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  RefreshTokenApiResponse
} from '@/types/auth.type';
import type { ResponseApi } from '@/types/responseApi.type';

export const authService = {
  login: async (request: LoginRequest) => {
    const response = await axiosClient.post<AuthResponse>('/auth/admin/login', request);
    return response;
  },

  refreshToken: async (request: RefreshTokenRequest) => {
    const response = await axiosClient.post<RefreshTokenApiResponse>('/auth/refresh-token', request);
    return response;
  },
  socialLoginCallback: async (login_type: string, code: string) => {
    const response = await axiosClient.get<AuthResponse>(`/auth/social-login/callback`, { params: { login_type, code } });
    return response;
  },
  socialLogin: async (login_type: string) => { 
    const response = await axiosClient.get<ResponseApi<string>>(`/auth/social-login`, { params: { login_type } });
    return response;
  }
};
