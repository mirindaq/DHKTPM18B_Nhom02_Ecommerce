import axios from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import LocalStorageUtil from "@/utils/localStorage.util";

// Khởi tạo instance
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1", // đổi thành URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = LocalStorageUtil.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Biến để tránh refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data luôn cho gọn
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua interceptor cho request refresh token để tránh vòng lặp
    if (originalRequest._skipAuthInterceptor) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = LocalStorageUtil.getRefreshToken();
      
      if (refreshToken) {
        try {
          console.log('chay vo day 1', refreshToken);
          const response = await authService.refreshToken({ refreshToken });
          console.log('chay vo day 2', response);
          const { accessToken, refreshToken: newRefreshToken } = (response.data as any).data;
          
          LocalStorageUtil.setTokens({ accessToken, refreshToken: newRefreshToken });
          
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          console.log('chay vo day 3', refreshError);
          processQueue(refreshError, null);

          // Xóa dữ liệu local trước khi logout để tránh vòng lặp
          LocalStorageUtil.clearAllData();
          
          // Thử logout nhưng không cần đợi kết quả
          try {
            await authService.logout();
          } catch (logoutError) {
            console.log('Logout failed, but continuing with redirect:', logoutError);
          }
          
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Xóa dữ liệu local trước khi logout để tránh vòng lặp
        LocalStorageUtil.clearAllData();
        
        // Thử logout nhưng không cần đợi kết quả
        try {
          await authService.logout();
        } catch (logoutError) {
          console.log('Logout failed, but continuing with redirect:', logoutError);
        }
        
        window.location.href = '/login';
        return Promise.reject(error);
      }
    } else if (error.response?.status === 401) {
      // Xóa dữ liệu local trước khi logout để tránh vòng lặp
      LocalStorageUtil.clearAllData();
      
      // Thử logout nhưng không cần đợi kết quả
      try {
        await authService.logout();
      } catch (logoutError) {
        console.log('Logout failed, but continuing with redirect:', logoutError);
      }
      
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response) {
      if (error.response.status === 403) {
        toast.error("Không có quyền truy cập");
      } else if (error.response.status === 500) {
        toast.error("Lỗi server, vui lòng thử lại sau");
      }
      throw error.response.data;
    }
    throw error;
  }
);

export default axiosClient;
