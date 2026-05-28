import { api } from "@/lib/axios";
import type {
  AuthLoginResponse,
  AuthRefreshResponse,
  AuthRegisterResponse,
  LoginFormValues,
  RegisterFormValues,
} from "@/types/auth";

export const authService = {
  register: async ({
    username,
    email,
    password,
  }: RegisterFormValues): Promise<AuthRegisterResponse> => {
    const res = await api.post<AuthRegisterResponse>(
      "/auth/register",
      { username, email, password },
      { withCredentials: true },
    );
    return res.data;
  },
  login: async ({
    email,
    password,
  }: LoginFormValues): Promise<AuthLoginResponse> => {
    const res = await api.post<AuthLoginResponse>(
      "/auth/login",
      { email, password },
      { withCredentials: true },
    );
    return res.data;
  },
  logout: async (): Promise<void> => {
    await api.post("/auth/logout", {}, { withCredentials: true });
  },
  refresh: async (): Promise<AuthRefreshResponse> => {
    const res = await api.post<AuthRefreshResponse>(
      "/auth/refresh",
      {},
      { withCredentials: true },
    );
    return res.data;
  },
};
