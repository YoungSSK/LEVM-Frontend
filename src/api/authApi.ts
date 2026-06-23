import axiosClient from "@/api/axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface RawAuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
  role: string;
}

const authApi = {
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    axiosClient.post<RawAuthResponse>("/auth/login", payload).then((res) => ({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken ?? "",
      role: res.data.role,
    })),

  refresh: (): Promise<{ accessToken: string; role: string }> =>
    axiosClient.post<RawAuthResponse>("/auth/refresh").then((res) => ({
      accessToken: res.data.accessToken,
      role: res.data.role,
    })),

  logout: () => axiosClient.post("/auth/logout"),
};

export default authApi;
