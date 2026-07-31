import axiosClient from "@/api/axiosClient";

// ===== Types =====

export type ReadingDifficulty =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "upper_intermediate"
  | "advanced";

export type ReadingCefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ReadingType =
  | "academic"
  | "general"
  | "narrative"
  | "descriptive"
  | "expository"
  | "argumentative"
  | "article"
  | "advertisement"
  | "notice"
  | "letter"
  | "report"
  | "other";

export type ReadingPassageStatus = "draft" | "published" | "archived";

// ===== Reading Category =====

export interface ReadingCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  color: string;
  order: number;
  passageCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReadingCategoryPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

export type UpdateReadingCategoryPayload = Partial<CreateReadingCategoryPayload>;

// ===== Reading Passage =====

export interface ReadingPassage {
  _id: string;
  categoryId: string | { _id: string; name: string; slug: string };
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  difficulty: ReadingDifficulty;
  cefrLevel: ReadingCefrLevel;
  readingType: ReadingType;
  tags: string[];
  wordCount: number;
  estimatedTime: number;
  order: number;
  status: ReadingPassageStatus;
  publishedAt?: string | null;
  xpReward: number;
  passThreshold: number;
  hasQuestions: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingPassageDetail extends ReadingPassage {
  htmlContent: string;
  plainText: string;
  contentUpdatedAt?: string | null;
  contentUpdatedBy?: string | null;
  clonedFrom?: string | null;
  createdBy?: { _id: string; username: string; displayName: string };
  updatedBy?: { _id: string; username: string; displayName: string };
}

export interface CreateReadingPassagePayload {
  categoryId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  htmlContent: string;
  plainText?: string;
  difficulty?: ReadingDifficulty;
  cefrLevel?: ReadingCefrLevel;
  readingType?: ReadingType;
  tags?: string[];
  estimatedTime?: number;
  order?: number;
  xpReward?: number;
  passThreshold?: number;
}

export type UpdateReadingPassagePayload = Partial<
  Omit<CreateReadingPassagePayload, "htmlContent" | "plainText">
>;

export interface UpdateReadingPassageContentPayload {
  htmlContent: string;
  plainText?: string;
  lastKnownContentUpdatedAt?: string | null;
}

export interface DocxPreviewResult {
  htmlContent: string;
  plainText: string;
  wordCount: number;
  warnings: string[];
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ===== API Object =====

const readingCategoryApi = {
  getAll: async (
    page = 1,
    limit = 20,
    options?: { search?: string; isActive?: boolean; sortBy?: string; sortOrder?: string },
  ): Promise<{ categories: ReadingCategory[]; pagination: PaginatedResult<never>["pagination"] }> => {
    const params: Record<string, string | number | boolean> = { page, limit };
    if (options?.search) params.search = options.search;
    if (options?.isActive !== undefined) params.isActive = options.isActive;
    if (options?.sortBy) params.sortBy = options.sortBy;
    if (options?.sortOrder) params.sortOrder = options.sortOrder;
    const res = await axiosClient.get<ApiEnvelope<{ categories: ReadingCategory[]; pagination: PaginatedResult<never>["pagination"] }>>(
      "/reading-categories",
      { params },
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<ReadingCategory> => {
    const res = await axiosClient.get<ApiEnvelope<ReadingCategory>>(
      `/reading-categories/${id}`,
    );
    return res.data.data;
  },

  getBySlug: async (slug: string): Promise<ReadingCategory> => {
    const res = await axiosClient.get<ApiEnvelope<ReadingCategory>>(
      `/reading-categories/slug/${slug}`,
    );
    return res.data.data;
  },

  create: async (payload: CreateReadingCategoryPayload): Promise<ReadingCategory> => {
    const res = await axiosClient.post<ApiEnvelope<ReadingCategory>>(
      "/reading-categories",
      payload,
    );
    return res.data.data;
  },

  update: async (id: string, payload: UpdateReadingCategoryPayload): Promise<ReadingCategory> => {
    const res = await axiosClient.patch<ApiEnvelope<ReadingCategory>>(
      `/reading-categories/${id}`,
      payload,
    );
    return res.data.data;
  },

  toggleStatus: async (id: string, isActive: boolean): Promise<{ categoryId: string; isActive: boolean }> => {
    const res = await axiosClient.patch<ApiEnvelope<{ categoryId: string; isActive: boolean }>>(
      `/reading-categories/${id}/status`,
      { isActive },
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/reading-categories/${id}`);
  },
};

export default readingCategoryApi;
