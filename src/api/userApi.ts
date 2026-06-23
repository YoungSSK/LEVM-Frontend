import axiosClient from "@/api/axiosClient";

export interface UserProfile {
  _id: string;
  email: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const userApi = {
  // GET /api/users/me
  getMe: (): Promise<UserProfile> =>
    axiosClient
      .get<ApiEnvelope<UserProfile>>("/users/me")
      .then((res) => res.data.data),

  // PATCH /api/users/me
  updateProfile: (payload: UpdateProfilePayload): Promise<UserProfile> =>
    axiosClient
      .patch<ApiEnvelope<UserProfile>>("/users/me", payload)
      .then((res) => res.data.data),

  // PATCH /api/users/change-password
  changePassword: (payload: ChangePasswordPayload): Promise<void> =>
    axiosClient
      .patch<ApiEnvelope<null>>("/users/change-password", payload)
      .then(() => undefined),
};

export default userApi;