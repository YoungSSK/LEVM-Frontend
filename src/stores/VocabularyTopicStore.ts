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
    id: string,
    payload: UpdateVocabularyTopicPayload,
  ) => Promise<void>;

  changeStatus: (
    id: string,
    currentStatus: boolean,
  ) => Promise<void>;

  remove: (id: string) => Promise<void>;

  fetchStatistics: (id: string) => Promise<void>;

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

    update: async (id, payload) => {
      const updated =
        await vocabularyTopicApi.update(
          id,
          payload,
        );

      set({
        topics: get().topics.map((topic) =>
          topic._id === id
            ? updated
            : topic,
        ),
      });
    },

    changeStatus: async (
      id,
      currentStatus,
    ) => {
      const updated =
        await vocabularyTopicApi.changeStatus(
          id,
          currentStatus,
        );

      set({
        topics: get().topics.map((topic) =>
          topic._id === id
            ? updated
            : topic,
        ),
      });
    },

    remove: async (id) => {
      await vocabularyTopicApi.delete(id);

      set({
        topics: get().topics.filter(
          (topic) => topic._id !== id,
        ),
      });
    },

    fetchStatistics: async (id) => {
      const statistics =
        await vocabularyTopicApi.getStatistics(id);

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