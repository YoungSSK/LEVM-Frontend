import axiosClient from "@/api/axiosClient";

export interface GrammarTopic {
  _id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail?: string;
  lessonCount: number;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarTopicDetail extends GrammarTopic {
  lessons?: {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    thumbnailUrl: string;
    estimatedTime: number;
    order: number;
    isPublished: boolean;
    isActive: boolean;
  }[];
}

export interface GrammarLessonWithTopic {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string;
  estimatedTime: number;
  order: number;
  isPublished: boolean;
  isActive: boolean;
}

export interface GrammarTopicWithProgress extends GrammarTopic {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface TopicPaginationResponse {
  topics: GrammarTopic[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateGrammarTopicPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateGrammarTopicPayload {
  name?: string;
  description?: string;
  thumbnail?: string;
  order?: number;
  isActive?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const grammarTopicApi = {
  // GET /grammar-topics
  getAll: (page = 1, limit = 10): Promise<TopicPaginationResponse> =>
    axiosClient
      .get<ApiEnvelope<TopicPaginationResponse>>(
        `/grammar-topics?page=${page}&limit=${limit}`,
      )
      .then((res) => res.data.data),

  // GET /grammar-topics/:slug (via dual-mode endpoint — backend accepts slug here)
  getBySlug: (slug: string): Promise<GrammarTopicDetail> =>
    axiosClient
      .get<ApiEnvelope<GrammarTopicDetail>>(`/grammar-topics/${slug}`)
      .then((res) => res.data.data),

  // POST /grammar-topics
  create: (payload: CreateGrammarTopicPayload): Promise<GrammarTopic> =>
    axiosClient
      .post<ApiEnvelope<GrammarTopic>>("/grammar-topics", payload)
      .then((res) => res.data.data),

  // PATCH /grammar-topics/:id
  update: (
    topicId: string,
    payload: UpdateGrammarTopicPayload,
  ): Promise<GrammarTopic> =>
    axiosClient
      .patch<ApiEnvelope<GrammarTopic>>(`/grammar-topics/${topicId}`, payload)
      .then((res) => res.data.data),

  // PATCH /grammar-topics/:id/status
  changeStatus: (
    topicId: string,
    currentStatus: boolean,
  ): Promise<GrammarTopic> =>
    axiosClient
      .patch<ApiEnvelope<GrammarTopic>>(`/grammar-topics/${topicId}/status`, {
        isActive: currentStatus,
      })
      .then((res) => res.data.data),

  // DELETE /grammar-topics/:id
  delete: (topicId: string): Promise<void> =>
    axiosClient.delete(`/grammar-topics/${topicId}`).then(() => undefined),
};

export default grammarTopicApi;
