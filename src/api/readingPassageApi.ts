import axiosClient from "@/api/axiosClient";
import type {
  ReadingPassage,
  ReadingPassageDetail,
  CreateReadingPassagePayload,
  UpdateReadingPassagePayload,
  UpdateReadingPassageContentPayload,
  DocxPreviewResult,
  ReadingDifficulty,
  ReadingCefrLevel,
  ReadingPassageStatus,
} from "@/api/readingCategoryApi";

// Re-export types for convenience
export type {
  ReadingPassage,
  ReadingPassageDetail,
  CreateReadingPassagePayload,
  UpdateReadingPassagePayload,
  UpdateReadingPassageContentPayload,
  DocxPreviewResult,
  ReadingDifficulty,
  ReadingCefrLevel,
  ReadingPassageStatus,
};

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPassagesOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ReadingPassageStatus;
  difficulty?: ReadingDifficulty;
  cefrLevel?: ReadingCefrLevel;
  readingType?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const readingPassageApi = {
  getAll: async (
    options: GetPassagesOptions = {},
  ): Promise<{ passages: ReadingPassage[]; pagination: PaginationMeta }> => {
    const params: Record<string, string | number> = {
      page: options.page ?? 1,
      limit: options.limit ?? 10,
    };
    if (options.search) params.search = options.search;
    if (options.categoryId) params.categoryId = options.categoryId;
    if (options.status) params.status = options.status;
    if (options.difficulty) params.difficulty = options.difficulty;
    if (options.cefrLevel) params.cefrLevel = options.cefrLevel;
    if (options.readingType) params.readingType = options.readingType;
    if (options.tags) params.tags = options.tags;
    if (options.sortBy) params.sortBy = options.sortBy;
    if (options.sortOrder) params.sortOrder = options.sortOrder;

    const res = await axiosClient.get<
      ApiEnvelope<{ passages: ReadingPassage[]; pagination: PaginationMeta }>
    >("/reading-passages", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<ReadingPassageDetail> => {
    const res = await axiosClient.get<ApiEnvelope<ReadingPassageDetail>>(
      `/reading-passages/${id}`,
    );
    return res.data.data;
  },

  getBySlug: async (slug: string): Promise<ReadingPassageDetail> => {
    const res = await axiosClient.get<ApiEnvelope<ReadingPassageDetail>>(
      `/reading-passages/slug/${slug}`,
    );
    return res.data.data;
  },

  getByCategory: async (
    categoryId: string,
    options: { page?: number; limit?: number; status?: ReadingPassageStatus } = {},
  ): Promise<{
    category: { _id: string; name: string; slug: string };
    passages: ReadingPassage[];
    pagination: PaginationMeta;
  }> => {
    const params: Record<string, string | number> = {
      page: options.page ?? 1,
      limit: options.limit ?? 10,
    };
    if (options.status) params.status = options.status;
    const res = await axiosClient.get<
      ApiEnvelope<{
        category: { _id: string; name: string; slug: string };
        passages: ReadingPassage[];
        pagination: PaginationMeta;
      }>
    >(`/reading-passages/category/${categoryId}`, { params });
    return res.data.data;
  },

  create: async (
    payload: CreateReadingPassagePayload,
  ): Promise<ReadingPassage> => {
    const res = await axiosClient.post<ApiEnvelope<ReadingPassage>>(
      "/reading-passages",
      payload,
    );
    return res.data.data;
  },

  /**
   * Preview DOCX — parse file, trả HTML mà không lưu DB.
   * Dùng trước khi tạo passage để admin xem trước nội dung.
   */
  previewDocument: async (file: File): Promise<DocxPreviewResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post<ApiEnvelope<DocxPreviewResult>>(
      "/reading-passages/preview-document",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  createFromDocument: async (
    file: File,
    metadata: Omit<CreateReadingPassagePayload, "htmlContent" | "plainText">,
  ): Promise<ReadingPassage> => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(metadata).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) {
          v.forEach((item) => formData.append(k, String(item)));
        } else {
          formData.append(k, String(v));
        }
      }
    });
    const res = await axiosClient.post<ApiEnvelope<ReadingPassage>>(
      "/reading-passages/from-document",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  updateFromDocument: async (
    passageId: string,
    file: File,
    metadata?: UpdateReadingPassagePayload,
  ): Promise<ReadingPassage> => {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });
    }
    const res = await axiosClient.post<ApiEnvelope<ReadingPassage>>(
      `/reading-passages/${passageId}/from-document`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  update: async (
    passageId: string,
    payload: UpdateReadingPassagePayload,
  ): Promise<ReadingPassage> => {
    const res = await axiosClient.patch<ApiEnvelope<ReadingPassage>>(
      `/reading-passages/${passageId}`,
      payload,
    );
    return res.data.data;
  },

  updateContent: async (
    passageId: string,
    payload: UpdateReadingPassageContentPayload,
  ): Promise<{
    _id: string;
    wordCount: number;
    contentUpdatedAt: string;
    contentUpdatedBy: string | null;
  }> => {
    const res = await axiosClient.put<
      ApiEnvelope<{
        _id: string;
        wordCount: number;
        contentUpdatedAt: string;
        contentUpdatedBy: string | null;
      }>
    >(`/reading-passages/${passageId}/content`, payload);
    return res.data.data;
  },

  changeStatus: async (
    passageId: string,
    status: ReadingPassageStatus,
  ): Promise<{ passageId: string; status: ReadingPassageStatus; publishedAt: string | null }> => {
    const res = await axiosClient.patch<
      ApiEnvelope<{ passageId: string; status: ReadingPassageStatus; publishedAt: string | null }>
    >(`/reading-passages/${passageId}/status`, { status });
    return res.data.data;
  },

  changeOrder: async (
    passageId: string,
    order: number,
  ): Promise<{ passageId: string; order: number }> => {
    const res = await axiosClient.patch<ApiEnvelope<{ passageId: string; order: number }>>(
      `/reading-passages/${passageId}/order`,
      { order },
    );
    return res.data.data;
  },

  clone: async (passageId: string): Promise<ReadingPassage> => {
    const res = await axiosClient.post<ApiEnvelope<ReadingPassage>>(
      `/reading-passages/${passageId}/clone`,
    );
    return res.data.data;
  },

  delete: async (passageId: string): Promise<void> => {
    await axiosClient.delete(`/reading-passages/${passageId}`);
  },
};

export default readingPassageApi;
