import { create } from "zustand";

import occupationApi from "@/api/occupationApi";
import type {
  CreateOccupationPayload,
  Occupation,
  UpdateOccupationPayload,
} from "@/api/occupationApi";

interface OccupationState {
  occupations: Occupation[];
  allOccupations: Occupation[];
  activeCategoryId: string | null;
  isLoading: boolean;
  error: string | null;

  /** Lấy tất cả occupations */
  fetchAll: () => Promise<void>;
  /** Lấy danh sách occupation theo nhóm ngành đang chọn */
  fetchByCategory: (categoryId: string) => Promise<void>;
  create: (payload: CreateOccupationPayload) => Promise<void>;
  update: (id: string, payload: UpdateOccupationPayload) => Promise<void>;
  reset: () => void;
}

export const useOccupationStore = create<OccupationState>((set, get) => ({
  occupations: [],
  allOccupations: [],
  activeCategoryId: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const occupations = await occupationApi.getAll();
      set({ allOccupations: occupations, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi tải danh sách";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  fetchByCategory: async (categoryId) => {
    set({ isLoading: true, error: null, activeCategoryId: categoryId });
    try {
      const occupations = await occupationApi.getByCategory(categoryId);
      set({ occupations, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi tải danh sách";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  create: async (payload) => {
    const newOccupation = await occupationApi.create(payload);
    // Chỉ chèn vào danh sách hiện tại nếu occupation mới thuộc category đang xem
    if (get().activeCategoryId === payload.categoryId) {
      set({ occupations: [newOccupation, ...get().occupations] });
    }
    // Luôn thêm vào allOccupations
    set({ allOccupations: [newOccupation, ...get().allOccupations] });
  },

  update: async (id, payload) => {
    const updated = await occupationApi.update(id, payload);
    const current = get().occupations;
    const allCurrent = get().allOccupations;

    // Nếu đổi categoryId sang nhóm khác, loại occupation này khỏi danh sách đang xem
    if (
      payload.categoryId !== undefined &&
      payload.categoryId !== get().activeCategoryId
    ) {
      set({ occupations: current.filter((item) => item._id !== id) });
    } else {
      set({
        occupations: current.map((item) => (item._id === id ? updated : item)),
      });
    }

    // Cập nhật allOccupations
    if (
      payload.categoryId !== undefined &&
      payload.categoryId !== updated.categoryId
    ) {
      set({ allOccupations: allCurrent.filter((item) => item._id !== id) });
    } else {
      set({
        allOccupations: allCurrent.map((item) =>
          item._id === id ? updated : item
        ),
      });
    }
  },

  reset: () =>
    set({
      occupations: [],
      allOccupations: [],
      activeCategoryId: null,
      isLoading: false,
      error: null,
    }),
}));