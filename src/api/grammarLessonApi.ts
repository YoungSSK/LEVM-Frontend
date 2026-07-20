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
  lessonType?: LessonType;
  parentLessonId?: string | null;
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
  isCompleted?: boolean;
  completedAt?: string;
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
  previousLesson?: { _id: string; title: string; slug: string };
  nextLesson?: { _id: string; title: string; slug: string };
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
};

export default grammarLessonApi;
