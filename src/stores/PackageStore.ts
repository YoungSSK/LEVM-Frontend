import { create } from "zustand";
import packageApi from "@/api/packageApi";
import type { Package, CreatePackagePayload, UpdatePackagePayload } from "@/api/packageApi";

interface PackageState {
  packages: Package[];
  isLoading: boolean;
  error: string | null;

  fetchAll: (includeInactive?: boolean) => Promise<void>;
  create: (payload: CreatePackagePayload) => Promise<void>;
  update: (id: string, payload: UpdatePackagePayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  isLoading: false,
  error: null,

  fetchAll: async (includeInactive = true) => {
    set({ isLoading: true, error: null });
    try {
      const packages = await packageApi.getAllAdmin(includeInactive);
      set({ packages, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tải danh sách gói";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  create: async (payload) => {
    const pkg = await packageApi.create(payload);
    set({ packages: [pkg, ...get().packages] });
  },

  update: async (id, payload) => {
    const updated = await packageApi.update(id, payload);
    set({ packages: get().packages.map((p) => (p._id === updated._id ? updated : p)) });
  },

  remove: async (id) => {
    await packageApi.delete(id);
    // Soft delete — chỉ set isActive=false, không xoá khỏi list ngay
    set({
      packages: get().packages.map((p) =>
        p._id === id ? { ...p, isActive: false } : p,
      ),
    });
  },

  reset: () => set({ packages: [], isLoading: false, error: null }),
}));
