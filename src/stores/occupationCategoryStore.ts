import { create } from "zustand";

import occupationCategoryApi from "@/api/occupationCategoryApi";
import type {
  CreateOccupationCategoryPayload,
  OccupationCategory,
  UpdateOccupationCategoryPayload,
} from "@/api/occupationCategoryApi";

interface OccupationCategoryState {
  categories: OccupationCategory[];
  isLoading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  create: (payload: CreateOccupationCategoryPayload) => Promise<void>;
  update: (
    id: string,
    payload: UpdateOccupationCategoryPayload,
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useOccupationCategoryStore = create<OccupationCategoryState>(
  (set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const categories = await occupationCategoryApi.getAll();
        set({ categories, isLoading: false });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Lỗi tải danh sách";
        set({ isLoading: false, error: message });
        throw error;
      }
    },

    create: async (payload) => {
      const newCategory = await occupationCategoryApi.create(payload);
      set({ categories: [newCategory, ...get().categories] });
    },

    update: async (id, payload) => {
      const updated = await occupationCategoryApi.update(id, payload);
      set({
        categories: get().categories.map((category) =>
          category._id === id ? updated : category,
        ),
      });
    },

    remove: async (id) => {
      await occupationCategoryApi.remove(id);
      set({
        categories: get().categories.filter(
          (category) => category._id !== id,
        ),
      });
    },

    reset: () => set({ categories: [], isLoading: false, error: null }),
  }),
);