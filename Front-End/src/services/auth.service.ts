
import axiosClient from '@/configurations/axios.config';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenApiResponse,
  ProfileResponse
} from '@/types/auth.type';
import type { ResponseApi } from '@/types/responseApi.type';

export const authService = {
  login: async (request: LoginRequest) => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', request);
    return response;
  },
  adminLogin: async (request: LoginRequest) => {
    const response = await axiosClient.post<AuthResponse>('/auth/admin/login', request);
    return response;
  },

  register: async (request: RegisterRequest) => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', request);
    return response;
  },

  refreshToken: async () => {
    const response = await axiosClient.post<RefreshTokenApiResponse>('/auth/refresh-token', {}, {
      withCredentials: true, // Gửi cookie (refresh token) kèm theo request
      // @ts-ignore - Custom property để bỏ qua interceptor
      _skipAuthInterceptor: true // Bỏ qua interceptor để tránh vòng lặp
    });
    return response;
  },
  
  socialLoginCallback: async (login_type: string, code: string) => {
    const response = await axiosClient.get<AuthResponse>(`/auth/social-login/callback`, { params: { login_type, code } });
    return response;
  },
  
  socialLogin: async (login_type: string) => { 
    const response = await axiosClient.get<ResponseApi<string>>(`/auth/social-login`, { params: { login_type } });
    return response;
  },

  getProfile: async () => {
    const response = await axiosClient.get<ProfileResponse>('/auth/profile');
    return response;
  },

  logout: async () => {
    const response = await axiosClient.post('/auth/logout', {}, {
      withCredentials: true, // Gửi cookie (refresh token) kèm theo request
    });
    return response;
  }
};
