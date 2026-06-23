import { create } from "zustand";

import userApi from "@/api/userApi";
import type { UserProfile, UpdateProfilePayload } from "@/api/userApi";

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<UserProfile>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>;
  setProfile: (profile: UserProfile | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: false,
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
    set({ loading: true, error: null });
    try {
      const updatedProfile = await userApi.updateProfile(payload);
      set({ profile: updatedProfile, loading: false });
      return updatedProfile;
    } catch (err) {
      set({ error: "Failed to update profile", loading: false });
      throw err;
    }
  },

  setProfile: (profile) => set({ profile }),

  reset: () => set({ profile: null, loading: false, error: null }),
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
