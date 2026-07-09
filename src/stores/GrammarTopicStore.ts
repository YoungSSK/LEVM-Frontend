import { create } from "zustand";

import grammarTopicApi from "@/api/grammarTopicApi";

import type {
  GrammarTopic,
  CreateGrammarTopicPayload,
  UpdateGrammarTopicPayload,
} from "@/api/grammarTopicApi";

interface GrammarTopicState {
  topics: GrammarTopic[];
  isLoading: boolean;
  error: string | null;

  fetchAll: (page?: number, limit?: number) => Promise<void>;
  create: (payload: CreateGrammarTopicPayload) => Promise<void>;
  update: (
    topicId: string,
    payload: UpdateGrammarTopicPayload,
  ) => Promise<void>;
  changeStatus: (
    topicId: string,
    currentStatus: boolean,
  ) => Promise<void>;
  remove: (topicId: string) => Promise<void>;
  reset: () => void;
}

export const useGrammarTopicStore = create<GrammarTopicState>((set, get) => ({
  topics: [],
  isLoading: false,
  error: null,

  fetchAll: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const result = await grammarTopicApi.getAll(page, limit);

      set({
        topics: result.topics,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi tải danh sách chủ đề";

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  create: async (payload) => {
    const topic = await grammarTopicApi.create(payload);

    set({
      topics: [topic, ...get().topics],
    });
  },

  update: async (topicId, payload) => {
    const updated = await grammarTopicApi.update(topicId, payload);

    set({
      topics: get().topics.map((topic) =>
        topic._id === updated._id ? updated : topic,
      ),
    });
  },

  changeStatus: async (topicId, currentStatus) => {
    const updated = await grammarTopicApi.changeStatus(topicId, currentStatus);

    set({
      topics: get().topics.map((topic) =>
        topic._id === updated._id ? updated : topic,
      ),
    });
  },

  remove: async (topicId) => {
    await grammarTopicApi.delete(topicId);

    set({
      topics: get().topics.filter((topic) => topic._id !== topicId),
    });
  },

  reset: () =>
    set({
      topics: [],
      isLoading: false,
      error: null,
    }),
}));
