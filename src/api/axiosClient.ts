import axios from "axios";

import { authStore } from "@/stores/authStore";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ví dụ: http://localhost:5001/api
  withCredentials: true, // gửi cookie refreshToken (httpOnly)
});

axiosClient.interceptors.request.use((config) => {
  const token = authStore.getState?.().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Các request liên quan auth không được phép tự kích hoạt vòng refresh-retry,
// nếu không sẽ tự gọi lại chính nó khi thất bại -> vòng lặp vô hạn.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/register"];

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const shouldTryRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest?.url);

    if (shouldTryRefresh) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        authStore.getState?.().setAccessToken?.(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Không hard-redirect ở đây. Chỉ xóa session local, để React Router
        // (ProtectedRoute/AnonymousRoute) tự điều hướng dựa trên accessToken.
        authStore.getState?.().setAccessToken?.(null);
        return Promise.reject(refreshError);
      }
    }

    // Thống nhất message lỗi để mọi nơi catch chỉ cần đọc error.message
    const message =
      error.response?.data?.message || error.message || "Lỗi hệ thống";
    return Promise.reject(new Error(message));
  },
);

export default axiosClient;