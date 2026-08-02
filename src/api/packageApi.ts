import axiosClient from "@/api/axiosClient";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Package {
  _id: string;
  name: string;
  slug: string;
  level: number;
  price: number;
  currency: string;
  durationInDays: number | null;
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagePayload {
  name: string;
  slug: string;
  level: number;
  price: number;
  currency?: string;
  durationInDays?: number | null;
  description?: string;
  features?: string[];
}

export type UpdatePackagePayload = Partial<CreatePackagePayload>;

export interface Subscription {
  _id: string;
  userId: { _id: string; username: string; email: string; displayName: string };
  packageId: { _id: string; name: string; slug: string; level: number };
  status: "pending_payment" | "active" | "expired" | "cancelled";
  startAt: string | null;
  endAt: string | null;
  autoRenew: boolean;
  createdAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Package API ───────────────────────────────────────────────────────────────

const packageApi = {
  /** Lấy danh sách gói active (public) */
  getActive: async (): Promise<Package[]> => {
    const res = await axiosClient.get<ApiEnvelope<Package[]>>("/packages");
    return res.data.data;
  },

  /** Lấy tất cả gói (admin — kể cả inactive) */
  getAllAdmin: async (includeInactive = true): Promise<Package[]> => {
    const res = await axiosClient.get<ApiEnvelope<Package[]>>("/packages/admin", {
      params: { includeInactive },
    });
    return res.data.data;
  },

  /** Tạo gói mới */
  create: async (payload: CreatePackagePayload): Promise<Package> => {
    const res = await axiosClient.post<ApiEnvelope<Package>>("/packages", payload);
    return res.data.data;
  },

  /** Cập nhật gói */
  update: async (id: string, payload: UpdatePackagePayload): Promise<Package> => {
    const res = await axiosClient.patch<ApiEnvelope<Package>>(`/packages/${id}`, payload);
    return res.data.data;
  },

  /** Xoá gói (soft delete) */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/packages/${id}`);
  },

  // ── Gán gói cho content ──────────────────────────────────────────────────────

  assignToGrammarLesson: async (lessonId: string, packageIds: string[]): Promise<void> => {
    await axiosClient.patch(`/packages/assign/grammar-lessons/${lessonId}`, { packageIds });
  },

  assignToVocabularyLesson: async (lessonId: string, packageIds: string[]): Promise<void> => {
    await axiosClient.patch(`/packages/assign/vocabulary-lessons/${lessonId}`, { packageIds });
  },

  assignToReadingPassage: async (passageId: string, packageIds: string[]): Promise<void> => {
    await axiosClient.patch(`/packages/assign/reading-passages/${passageId}`, { packageIds });
  },
};

export default packageApi;

// ── Subscription API ──────────────────────────────────────────────────────────

export const subscriptionApi = {
  /** Admin: xem tất cả subscriptions với filter */
  getAll: async (params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ subscriptions: Subscription[]; total: number; page: number; limit: number }> => {
    const res = await axiosClient.get<ApiEnvelope<{ subscriptions: Subscription[]; total: number; page: number; limit: number }>>(
      "/subscriptions/admin/all",
      { params },
    );
    return res.data.data;
  },

  /** User: xem gói hiện tại */
  getMine: async () => {
    const res = await axiosClient.get("/subscriptions/me");
    return res.data.data;
  },
};
