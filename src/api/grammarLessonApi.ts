import axiosClient from "@/api/axiosClient";

export type LessonType = "theory" | "exercise";

export interface GrammarLesson {
  _id: string;
  topicId: string;
  title: string;
  slug: string;
  shortDescription: string;
  htmlContent: string;
  plainTextContent: string;
  thumbnailUrl: string;
  estimatedTime: number;
  order: number;
  isPublished: boolean;
  isActive: boolean;
  /** @deprecated sẽ xoá — dùng GrammarQuizQuestion */
  lessonType?: LessonType;
  /** @deprecated sẽ xoá — dùng GrammarQuizQuestion */
  parentLessonId?: string | null;
  /** Cộng XP khi user pass quiz lesson này (Admin chỉnh được). */
  xpReward: number;
  /** % đúng tối thiểu để tính "đạt" (mặc định 70). */
  passThreshold: number;
  /** Cờ cho biết lesson đã có câu hỏi quiz hay chưa. */
  hasQuiz: boolean;
  /** Audit timestamp cho autosave content. */
  contentUpdatedAt?: string | null;
  /** Danh sách ID gói thành viên được phép truy cập (rỗng = Free) */
  allowedPackageIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarLessonWithProgress {
  _id: string;
  topicId: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string;
  estimatedTime: number;
  order: number;
  isPublished: boolean;
  isActive: boolean;
  lessonType?: LessonType;
  parentLessonId?: string | null;
  xpReward: number;
  passThreshold: number;
  hasQuiz: boolean;
  isCompleted?: boolean;
  completedAt?: string;
  allowedPackageIds?: string[];
}

export interface GrammarLessonDetail {
  _id: string;
  topicId: {
    _id: string;
    name: string;
    slug: string;
  };
  title: string;
  slug: string;
  shortDescription: string;
  htmlContent: string;
  plainTextContent: string;
  thumbnailUrl: string;
  estimatedTime: number;
  order: number;
  isPublished: boolean;
  isActive: boolean;
  lessonType?: LessonType;
  parentLessonId?: string | null;
  xpReward: number;
  passThreshold: number;
  hasQuiz: boolean;
  contentUpdatedAt?: string | null;
  previousLesson?: { _id: string; title: string; slug: string };
  nextLesson?: { _id: string; title: string; slug: string };
  allowedPackageIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGrammarLessonPayload {
  topicId: string;
  title: string;
  shortDescription?: string;
  htmlContent?: string;
  plainTextContent?: string;
  thumbnailUrl?: string;
  estimatedTime?: number;
  order?: number;
  isPublished?: boolean;
  isActive?: boolean;
  lessonType?: LessonType;
  parentLessonId?: string | null;
  xpReward?: number;
  passThreshold?: number;
  allowedPackageIds?: string[];
}

export interface UpdateGrammarLessonPayload {
  topicId?: string;
  title?: string;
  shortDescription?: string;
  htmlContent?: string;
  plainTextContent?: string;
  thumbnailUrl?: string;
  estimatedTime?: number;
  order?: number;
  isPublished?: boolean;
  isActive?: boolean;
  lessonType?: LessonType;
  parentLessonId?: string | null;
  xpReward?: number;
  passThreshold?: number;
  allowedPackageIds?: string[];
}

export interface UpdateGrammarLessonContentResponse {
  _id: string;
  contentUpdatedAt: string;
  contentUpdatedBy: string | null;
  plainTextContent: string;
}

export interface LessonOrderItem {
  lessonId: string;
  order: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const grammarLessonApi = {
  // GET /grammar-lessons
  getAll: (
    page = 1,
    limit = 10,
    topicId?: string,
  ): Promise<{
    lessons: GrammarLesson[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> =>
    axiosClient
      .get<ApiEnvelope<{
        lessons: GrammarLesson[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>>(
        `/grammar-lessons?page=${page}&limit=${limit}${topicId ? `&topicId=${topicId}` : ""}`,
      )
      .then((res) => res.data.data),

  // GET /grammar-lessons/slug/:slug
  getBySlug: (lessonSlug: string): Promise<GrammarLessonDetail> =>
    axiosClient
      .get<ApiEnvelope<GrammarLessonDetail>>(`/grammar-lessons/slug/${lessonSlug}`)
      .then((res) => res.data.data),

  // POST /grammar-lessons
  create: (payload: CreateGrammarLessonPayload): Promise<GrammarLesson> =>
    axiosClient
      .post<ApiEnvelope<GrammarLesson>>("/grammar-lessons", payload)
      .then((res) => res.data.data),

  // PATCH /grammar-lessons/:id
  update: (lessonId: string, payload: UpdateGrammarLessonPayload): Promise<GrammarLesson> =>
    axiosClient
      .patch<ApiEnvelope<GrammarLesson>>(`/grammar-lessons/${lessonId}`, payload)
      .then((res) => res.data.data),

  // PATCH /grammar-lessons/:id/status
  changeStatus: (lessonId: string): Promise<{ lessonId: string; isActive: boolean }> =>
    axiosClient
      .patch<ApiEnvelope<{ lessonId: string; isActive: boolean }>>(
        `/grammar-lessons/${lessonId}/status`,
      )
      .then((res) => res.data.data),

  // PATCH /grammar-lessons/:id/publish-status
  changePublishStatus: (
    lessonId: string,
  ): Promise<{ lessonId: string; isPublished: boolean }> =>
    axiosClient
      .patch<ApiEnvelope<{ lessonId: string; isPublished: boolean }>>(
        `/grammar-lessons/${lessonId}/publish-status`,
      )
      .then((res) => res.data.data),

  // DELETE /grammar-lessons/:id
  delete: (lessonId: string): Promise<void> =>
    axiosClient.delete(`/grammar-lessons/${lessonId}`).then(() => undefined),

  // PATCH /grammar-lessons/:id/order
  changeOrder: (lessonId: string, order: number): Promise<void> =>
    axiosClient
      .patch(`/grammar-lessons/${lessonId}/order`, { order })
      .then(() => undefined),

  // GET /grammar-lessons/:id — dùng để reload nội dung khi conflict (autosave).
  getById: (lessonId: string): Promise<GrammarLessonDetail> =>
    axiosClient
      .get<ApiEnvelope<GrammarLessonDetail>>(`/grammar-lessons/${lessonId}`)
      .then((res) => res.data.data),

  /**
   * PUT /grammar-lessons/:id/content — autosave editor lý thuyết.
   * Tách riêng khỏi update() để không xung đột với metadata và cho phép debounce.
   */
  updateContent: (
    lessonId: string,
    htmlContent: string,
    lastKnownContentUpdatedAt?: string | null,
  ): Promise<UpdateGrammarLessonContentResponse> =>
    axiosClient
      .put<
        ApiEnvelope<UpdateGrammarLessonContentResponse>
      >(`/grammar-lessons/${lessonId}/content`, {
        htmlContent,
        lastKnownContentUpdatedAt: lastKnownContentUpdatedAt ?? undefined,
      })
      .then((res) => res.data.data),

  /**
   * POST /grammar-lessons/:id/from-document — upload DOCX để thay thế nội dung lesson đã tồn tại.
   */
  uploadFromDocument: (
    lessonId: string,
    file: File,
    metadata?: {
      title?: string;
      shortDescription?: string;
      thumbnailUrl?: string;
      estimatedTime?: number;
      isPublished?: boolean;
      isActive?: boolean;
      xpReward?: number;
      passThreshold?: number;
    },
  ): Promise<GrammarLesson> => {
    const form = new FormData();
    form.append("file", file);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          form.append(key, String(value));
        }
      });
    }
    return axiosClient
      .post<ApiEnvelope<GrammarLesson>>(
        `/grammar-lessons/${lessonId}/from-document`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((res) => res.data.data);
  },
};

export default grammarLessonApi;
