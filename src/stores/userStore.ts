import { create } from "zustand";

import userApi from "@/api/userApi";
import type { UserProfile, UpdateProfilePayload } from "@/api/userApi";

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;

  fetchProfile: () => Promise<UserProfile>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>;
  uploadAvatar: (file: File) => Promise<{ publicId: string; secureUrl: string }>;
  setProfile: (profile: UserProfile | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: false,
  uploading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await userApi.getMe();
      set({ profile, loading: false });
      return profile;
    } catch (err) {
      set({ error: "Failed to fetch profile", loading: false });
      throw err;
    }
  },

  updateProfile: async (payload) => {
    // Không set loading=true để tránh ảnh hưởng các component khác
    // Mỗi component tự quản lý state isSaving riêng
    try {
      const updatedProfile = await userApi.updateProfile(payload);
      set({ profile: updatedProfile });
      return updatedProfile;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      set({ error: message });
      throw err;
    }
  },

  uploadAvatar: async (file) => {
    set({ uploading: true, error: null });
    try {
      const result = await userApi.uploadAvatar(file);
      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              avatar: {
                publicId: result.publicId,
                secureUrl: result.secureUrl,
              },
            }
          : null,
        uploading: false,
      }));
      return result;
    } catch (err) {
      set({ error: "Failed to upload avatar", uploading: false });
      throw err;
    }
  },

  setProfile: (profile) => set({ profile }),

  reset: () => set({ profile: null, loading: false, uploading: false, error: null }),
}));

/**
 * Helper để dùng store bên ngoài component React
 */
export const userStore = {
  getState: useUserStore.getState,
  subscribe: useUserStore.subscribe,
  reset: () => useUserStore.getState().reset(),
  setProfile: (profile: UserProfile | null) => useUserStore.getState().setProfile(profile),
};