import axios from "axios";

// Khởi tạo instance
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1", // đổi thành URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s
});

// ✅ Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data luôn cho gọn
    return response;
  },
  (error) => {
    if (error.response) {
      // Xử lý lỗi chung (401, 403, 500...)
      // if (error.response.status === 401) {
      //   console.warn("Unauthorized - cần login lại");
      // }
      throw error.response.data; // backend trả message
    }
    throw error;
  }
);

export default axiosClient;
