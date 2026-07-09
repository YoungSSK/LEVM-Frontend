import { create } from "zustand";

import grammarLessonApi from "@/api/grammarLessonApi";

import type {
  GrammarLesson,
  GrammarLessonDetail,
  CreateGrammarLessonPayload,
  UpdateGrammarLessonPayload,
} from "@/api/grammarLessonApi";

interface GrammarLessonState {
  lessons: GrammarLesson[];
  selectedLesson: GrammarLessonDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchAll: (
    page?: number,
    limit?: number,
    topicId?: string,
  ) => Promise<void>;
  fetchBySlug: (lessonSlug: string) => Promise<void>;
  create: (payload: CreateGrammarLessonPayload) => Promise<void>;
  update: (
    lessonId: string,
    payload: UpdateGrammarLessonPayload,
  ) => Promise<void>;
  changeStatus: (lessonId: string) => Promise<void>;
  changePublishStatus: (lessonId: string) => Promise<void>;
  remove: (lessonId: string) => Promise<void>;
  reset: () => void;
}

export const useGrammarLessonStore = create<GrammarLessonState>((set, get) => ({
  lessons: [],
  selectedLesson: null,
  isLoading: false,
  error: null,

  fetchAll: async (page = 1, limit = 10, topicId) => {
    set({ isLoading: true, error: null });

    try {
      const result = await grammarLessonApi.getAll(page, limit, topicId);

      set({
        lessons: result.lessons,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi tải danh sách bài học";

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  fetchBySlug: async (lessonSlug) => {
    set({ isLoading: true, error: null });

    try {
      const lesson = await grammarLessonApi.getBySlug(lessonSlug);

      set({
        selectedLesson: lesson,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi tải chi tiết bài học";

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  create: async (payload) => {
    const lesson = await grammarLessonApi.create(payload);

    set({
      lessons: [...get().lessons, lesson],
    });
  },

  update: async (lessonId, payload) => {
    const updated = await grammarLessonApi.update(lessonId, payload);

    set({
      lessons: get().lessons.map((lesson) =>
        lesson._id === updated._id ? updated : lesson,
      ),
    });
  },

  changeStatus: async (lessonId) => {
    const result = await grammarLessonApi.changeStatus(lessonId);

    set({
      lessons: get().lessons.map((lesson) =>
        lesson._id === result.lessonId
          ? { ...lesson, isActive: result.isActive }
          : lesson,
      ),
    });
  },

  changePublishStatus: async (lessonId) => {
    const result = await grammarLessonApi.changePublishStatus(lessonId);

    set({
      lessons: get().lessons.map((lesson) =>
        lesson._id === result.lessonId
          ? { ...lesson, isPublished: result.isPublished }
          : lesson,
      ),
    });
  },

  remove: async (lessonId) => {
    await grammarLessonApi.delete(lessonId);

    set({
      lessons: get().lessons.filter((lesson) => lesson._id !== lessonId),
    });
  },

  reset: () =>
    set({
      lessons: [],
      selectedLesson: null,
      isLoading: false,
      error: null,
    }),
}));
