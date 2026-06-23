import { create } from "zustand";

import authApi from "@/api/authApi";
import { userStore } from "@/stores/userStore";

interface AuthState {
  accessToken: string | null;
  role: string | null;
  /** true khi đã xác định xong có phiên đăng nhập hay không (sau bootstrapSession) */
  hydrated: boolean;

  setAccessToken: (token: string | null) => void;
  login: (accessToken: string, role: string) => void;
  logout: () => void;
  bootstrapSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  hydrated: false,

  setAccessToken: (token) => set({ accessToken: token }),

  login: (accessToken, role) => set({ accessToken, role }),

  logout: () => {
    set({ accessToken: null, role: null });
    userStore.reset();
    void authApi.logout().catch(() => {
      // bỏ qua lỗi logout phía server, vẫn xóa state local
    });
  },

  bootstrapSession: async () => {
    try {
      const { accessToken, role } = await authApi.refresh();
      set({ accessToken, role, hydrated: true });
    } catch {
      set({ accessToken: null, role: null, hydrated: true });
      userStore.reset();
    }
  },
}));

/**
 * Helper để dùng store bên ngoài component React (ví dụ trong axiosClient
 * interceptor), nơi không thể gọi hook trực tiếp.
 */
export const authStore = {
  getState: useAuthStore.getState,
  subscribe: useAuthStore.subscribe,
  login: (accessToken: string, role: string) =>
    useAuthStore.getState().login(accessToken, role),
  logout: () => useAuthStore.getState().logout(),
  setAccessToken: (token: string | null) =>
    useAuthStore.getState().setAccessToken(token),
  bootstrapSession: () => useAuthStore.getState().bootstrapSession(),
};