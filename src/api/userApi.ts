import axiosClient from "@/api/axiosClient";

export interface UserProfile {
  _id: string;
  email: string;
  username?: string;
  role: string;
  displayName?: string;
  avatar?: {
    publicId: string | null;
    secureUrl: string | null;
  };
  bio?: string;
  occupationId?: string | null;
  streak?: number;
  xp?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  occupationId?: string | null;
}

export interface ChangePasswordPayload {
  oldPassword: string;
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

  // PATCH /api/users/avatar
  uploadAvatar: (file: File): Promise<{ publicId: string; secureUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient
      .patch<ApiEnvelope<{ publicId: string; secureUrl: string }>>(
        "/users/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
      .then((res) => res.data.data);
  },

  // PATCH /api/users/change-password
  changePassword: (payload: ChangePasswordPayload): Promise<void> =>
    axiosClient
      .patch<ApiEnvelope<null>>("/users/change-password", payload)
      .then(() => undefined),
};

export default userApi;