import { create } from "zustand";

import wordApi from "@/api/wordApi";

import type {
  Word,
  WordPagination,
  CreateWordPayload,
  UpdateWordPayload,
} from "@/api/wordApi";

interface WordState {
  words: Word[];

  pagination: WordPagination["pagination"] | null;

  selectedWord: Word | null;

  isLoading: boolean;
  error: string | null;

  fetchAll: (
    page?: number,
    limit?: number,
  ) => Promise<void>;

  search: (keyword: string) => Promise<void>;

  getById: (id: string) => Promise<void>;

  create: (payload: CreateWordPayload) => Promise<void>;

  update: (
    id: string,
    payload: UpdateWordPayload,
  ) => Promise<void>;

  changeStatus: (
    id: string,
    isActive: boolean,
  ) => Promise<void>;

  remove: (id: string) => Promise<void>;

  reset: () => void;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: [],

  pagination: null,

  selectedWord: null,

  isLoading: false,
  error: null,

  fetchAll: async (page = 1, limit = 10) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const result = await wordApi.getAll(page, limit);

      set({
        words: result.words,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Lỗi tải danh sách từ";

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  search: async (keyword) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const words = await wordApi.search(keyword);

      set({
        words,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Lỗi tìm kiếm";

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  getById: async (id) => {
    const word = await wordApi.getById(id);

    set({
      selectedWord: word,
    });
  },

  create: async (payload) => {
    const newWord = await wordApi.create(payload);

    set({
      words: [newWord, ...get().words],
    });
  },

  update: async (id, payload) => {
    const updatedWord = await wordApi.update(
      id,
      payload,
    );

    set({
      words: get().words.map((word) =>
        word._id === id ? updatedWord : word,
      ),

      selectedWord:
        get().selectedWord?._id === id
          ? updatedWord
          : get().selectedWord,
    });
  },

  changeStatus: async (
    id,
    isActive,
  ) => {
    const updatedWord =
      await wordApi.changeStatus(
        id,
        isActive,
      );

    set({
      words: get().words.map((word) =>
        word._id === id ? updatedWord : word,
      ),

      selectedWord:
        get().selectedWord?._id === id
          ? updatedWord
          : get().selectedWord,
    });
  },

  remove: async (id) => {
    await wordApi.remove(id);

    set({
      words: get().words.filter(
        (word) => word._id !== id,
      ),

      selectedWord:
        get().selectedWord?._id === id
          ? null
          : get().selectedWord,
    });
  },

  reset: () =>
    set({
      words: [],
      pagination: null,
      selectedWord: null,
      isLoading: false,
      error: null,
    }),
}));