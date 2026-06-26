import axiosClient from "@/api/axiosClient";

export interface VocabularyTopic {
  _id: string;

  name: string;
  description: string;
  thumbnail: string;

  lessonCount: number;
  wordCount: number;

  isActive: boolean;
  order: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface TopicStatistics {
  totalLesson: number;
  activeLesson: number;
  inactiveLesson: number;

  totalWord: number;
  activeWord: number;
  inactiveWord: number;
}

export interface TopicPaginationResponse {
  topics: VocabularyTopic[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateVocabularyTopicPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  order?: number;
}

export interface UpdateVocabularyTopicPayload {
  name?: string;
  description?: string;
  thumbnail?: string;
  order?: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const vocabularyTopicApi = {
  // GET /vocabulary-topics
  getAll: (
    page = 1,
    limit = 10,
  ): Promise<TopicPaginationResponse> =>
    axiosClient
      .get<ApiEnvelope<TopicPaginationResponse>>(
        `/vocabulary-topics?page=${page}&limit=${limit}`,
      )
      .then((res) => res.data.data),

  // GET /vocabulary-topics/:id
  getById: (id: string): Promise<VocabularyTopic> =>
    axiosClient
      .get<ApiEnvelope<VocabularyTopic>>(
        `/vocabulary-topics/${id}`,
      )
      .then((res) => res.data.data),

  // POST /vocabulary-topics
  create: (
    payload: CreateVocabularyTopicPayload,
  ): Promise<VocabularyTopic> =>
    axiosClient
      .post<ApiEnvelope<VocabularyTopic>>(
        "/vocabulary-topics",
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /vocabulary-topics/:id
  update: (
    id: string,
    payload: UpdateVocabularyTopicPayload,
  ): Promise<VocabularyTopic> =>
    axiosClient
      .patch<ApiEnvelope<VocabularyTopic>>(
        `/vocabulary-topics/${id}`,
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /vocabulary-topics/:id/status
  changeStatus: (
    id: string,
    currentStatus: boolean,
  ): Promise<VocabularyTopic> =>
    axiosClient
      .patch<ApiEnvelope<VocabularyTopic>>(
        `/vocabulary-topics/${id}/status`,
        {
          isActive: currentStatus,
        },
      )
      .then((res) => res.data.data),

  // DELETE /vocabulary-topics/:id
  delete: (id: string): Promise<void> =>
    axiosClient
      .delete(`/vocabulary-topics/${id}`)
      .then(() => undefined),

  // GET /vocabulary-topics/:id/statistics
  getStatistics: (
    id: string,
  ): Promise<TopicStatistics> =>
    axiosClient
      .get<ApiEnvelope<TopicStatistics>>(
        `/vocabulary-topics/${id}/statistics`,
      )
      .then((res) => res.data.data),
};

export default vocabularyTopicApi;