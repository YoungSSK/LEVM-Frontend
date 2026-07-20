import { create } from "zustand";

import vocabularyTopicApi from "@/api/vocabularyTopicApi";

import type {
  VocabularyTopic,
  CreateVocabularyTopicPayload,
  UpdateVocabularyTopicPayload,
  TopicStatistics,
} from "@/api/vocabularyTopicApi";

interface VocabularyTopicState {
  topics: VocabularyTopic[];

  statistics: TopicStatistics | null;

  isLoading: boolean;
  error: string | null;

  fetchAll: (
    page?: number,
    limit?: number,
  ) => Promise<void>;

  create: (
    payload: CreateVocabularyTopicPayload,
  ) => Promise<void>;

  update: (
    topicSlug: string,
    payload: UpdateVocabularyTopicPayload,
  ) => Promise<void>;

  changeStatus: (
    topicSlug: string,
    currentStatus: boolean,
  ) => Promise<void>;

  remove: (topicSlug: string) => Promise<void>;

  fetchStatistics: (topicSlug: string) => Promise<void>;

  reset: () => void;
}

export const useVocabularyTopicStore =
  create<VocabularyTopicState>((set, get) => ({
    topics: [],

    statistics: null,

    isLoading: false,
    error: null,

    fetchAll: async (page = 1, limit = 10) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const result =
          await vocabularyTopicApi.getAll(
            page,
            limit,
          );

        set({
          topics: result.topics,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Lỗi tải danh sách chủ đề";

        set({
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    create: async (payload) => {
      const topic =
        await vocabularyTopicApi.create(payload);

      set({
        topics: [topic, ...get().topics],
      });
    },

    update: async (topicSlug, payload) => {
      const updated =
        await vocabularyTopicApi.update(
          topicSlug,
          payload,
        );

      set({
        topics: get().topics.map((topic) =>
          topic._id === updated._id
            ? updated
            : topic,
        ),
      });
    },

    changeStatus: async (
      topicSlug,
      currentStatus,
    ) => {
      const updated =
        await vocabularyTopicApi.changeStatus(
          topicSlug,
          currentStatus,
        );

      set({
        topics: get().topics.map((topic) =>
          topic._id === updated._id
            ? updated
            : topic,
        ),
      });
    },

    remove: async (topicSlug) => {
      await vocabularyTopicApi.delete(topicSlug);

      set({
        topics: get().topics.filter(
          (topic) => topic._id !== topicSlug,
        ),
      });
    },

    fetchStatistics: async (topicSlug) => {
      const statistics =
        await vocabularyTopicApi.getStatistics(topicSlug);

      set({
        statistics,
      });
    },

    reset: () =>
      set({
        topics: [],
        statistics: null,
        isLoading: false,
        error: null,
      }),
  }));
