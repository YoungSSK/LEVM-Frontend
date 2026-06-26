import { create } from "zustand";

import wordMeaningApi from "@/api/wordMeaningApi";

import type {
  WordMeaning,
  CreateMeaningPayload,
  UpdateMeaningPayload,
} from "@/api/wordMeaningApi";

interface WordMeaningState {
  meanings: WordMeaning[];

  selectedMeaning: WordMeaning | null;

  isLoading: boolean;
  error: string | null;

  fetchByWord: (wordId: string) => Promise<void>;

  getById: (meaningId: string) => Promise<void>;

  create: (wordId: string, payload: CreateMeaningPayload) => Promise<void>;

  update: (
    wordId: string,
    id: string,
    payload: UpdateMeaningPayload,
  ) => Promise<void>;

  setPrimary: (wordId: string, meaningId: string) => Promise<void>;

  changeStatus: (
    wordId: string,
    id: string,
    isActive: boolean,
  ) => Promise<void>;

  remove: (wordId: string, id: string) => Promise<void>;

  reset: () => void;

  refreshByWord: (wordId: string) => Promise<void>;
}

export const useWordMeaningStore = create<WordMeaningState>((set, get) => ({
  meanings: [],

  selectedMeaning: null,

  isLoading: false,
  error: null,

  fetchByWord: async (wordId) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const meanings = await wordMeaningApi.getByWord(wordId);

      set({
        meanings,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi tải danh sách nghĩa";

      set({
        error: message,
        isLoading: false,
      });

      throw error;
    }
  },
  refreshByWord: async (wordId) => {
    const meanings = await wordMeaningApi.getByWord(wordId);

    set({
      meanings,
    });
  },

  getById: async (meaningId) => {
    const meaning = await wordMeaningApi.getById(meaningId);

    set({
      selectedMeaning: meaning,
    });
  },

  create: async (wordId, payload) => {
    await wordMeaningApi.create(wordId, payload);

    await get().refreshByWord(wordId);
  },

  update: async (wordId, id, payload) => {
    await wordMeaningApi.update(id, payload);

    await get().refreshByWord(wordId);

    if (get().selectedMeaning?._id === id) {
      const updated = await wordMeaningApi.getById(id);

      set({
        selectedMeaning: updated,
      });
    }
  },

  setPrimary: async (wordId, meaningId) => {
    await wordMeaningApi.setPrimary(wordId, meaningId);

    await get().refreshByWord(wordId);

    const currentSelected = get().selectedMeaning;

    if (currentSelected) {
      const updated = await wordMeaningApi.getById(currentSelected._id);

      set({
        selectedMeaning: updated,
      });
    }
  },

  changeStatus: async (wordId, id, isActive) => {
    await wordMeaningApi.changeStatus(id, isActive);

    await get().refreshByWord(wordId);

    if (get().selectedMeaning?._id === id) {
      const updated = await wordMeaningApi.getById(id);

      set({
        selectedMeaning: updated,
      });
    }
  },

  remove: async (wordId, id) => {
    await wordMeaningApi.remove(id);

    await get().refreshByWord(wordId);

    if (get().selectedMeaning?._id === id) {
      set({
        selectedMeaning: null,
      });
    }
  },

  reset: () =>
    set({
      meanings: [],
      selectedMeaning: null,
      isLoading: false,
      error: null,
    }),
}));
