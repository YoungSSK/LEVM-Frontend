import { create } from "zustand";

import vocabularyLessonApi from "@/api/vocabularyLessonApi";

import type {
  VocabularyLesson,
  LessonWord,
  StudyWordResponse,
  CreateVocabularyLessonPayload,
  UpdateVocabularyLessonPayload,
  LessonOrderItem,
  AddWordPayload,
} from "@/api/vocabularyLessonApi";

interface VocabularyLessonState {
  lessons: VocabularyLesson[];

  selectedLesson: VocabularyLesson | null;

  words: LessonWord[];

  studyWords: StudyWordResponse | null;

  isLoading: boolean;
  error: string | null;

  fetchByTopic: (
    topicId: string,
  ) => Promise<void>;

  fetchById: (
    lessonId: string,
  ) => Promise<void>;

  create: (
    topicId: string,
    payload: CreateVocabularyLessonPayload,
  ) => Promise<void>;

  update: (
    id: string,
    payload: UpdateVocabularyLessonPayload,
  ) => Promise<void>;

  changeStatus: (
    id: string,
  ) => Promise<void>;

  remove: (
    id: string,
  ) => Promise<void>;

  changeOrder: (
    topicId: string,
    orders: LessonOrderItem[],
  ) => Promise<void>;

  fetchWords: (
    lessonId: string,
  ) => Promise<void>;

  addWord: (
    lessonId: string,
    payload: AddWordPayload,
  ) => Promise<void>;

  removeWord: (
    lessonId: string,
    wordId: string,
  ) => Promise<void>;

  fetchStudyWords: (
    lessonId: string,
  ) => Promise<void>;

  reset: () => void;
}

export const useVocabularyLessonStore =
  create<VocabularyLessonState>((set, get) => ({
    lessons: [],

    selectedLesson: null,

    words: [],

    studyWords: null,

    isLoading: false,
    error: null,

    fetchByTopic: async (topicId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const lessons =
          await vocabularyLessonApi.getByTopic(
            topicId,
          );

        set({
          lessons,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Lỗi tải bài học";

        set({
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    fetchById: async (lessonId) => {
      const lesson =
        await vocabularyLessonApi.getById(
          lessonId,
        );

      set({
        selectedLesson: lesson,
      });
    },

    create: async (
      topicId,
      payload,
    ) => {
      const lesson =
        await vocabularyLessonApi.create(
          topicId,
          payload,
        );

      set({
        lessons: [...get().lessons, lesson],
      });
    },

    update: async (
      id,
      payload,
    ) => {
      const updated =
        await vocabularyLessonApi.update(
          id,
          payload,
        );

      set({
        lessons: get().lessons.map((lesson) =>
          lesson._id === id
            ? updated
            : lesson,
        ),
      });
    },

    changeStatus: async (id) => {
      const result =
        await vocabularyLessonApi.changeStatus(
          id,
        );

      set({
        lessons: get().lessons.map((lesson) =>
          lesson._id === id
            ? {
                ...lesson,
                isActive: result.isActive,
              }
            : lesson,
        ),
      });
    },

    remove: async (id) => {
      await vocabularyLessonApi.delete(id);

      set({
        lessons: get().lessons.filter(
          (lesson) => lesson._id !== id,
        ),
      });
    },

    changeOrder: async (
      topicId,
      orders,
    ) => {
      await vocabularyLessonApi.changeOrder(
        topicId,
        orders,
      );

      await get().fetchByTopic(topicId);
    },

    fetchWords: async (lessonId) => {
      const words =
        await vocabularyLessonApi.getWords(
          lessonId,
        );

      set({
        words,
      });
    },

    addWord: async (
      lessonId,
      payload,
    ) => {
      await vocabularyLessonApi.addWord(
        lessonId,
        payload,
      );
    },

    removeWord: async (
      lessonId,
      wordId,
    ) => {
      await vocabularyLessonApi.removeWord(
        lessonId,
        wordId,
      );
    },

    fetchStudyWords: async (lessonId) => {
      const result =
        await vocabularyLessonApi.getStudyWords(
          lessonId,
        );

      set({
        studyWords: result,
      });
    },

    reset: () =>
      set({
        lessons: [],
        selectedLesson: null,
        words: [],
        studyWords: null,
        isLoading: false,
        error: null,
      }),
  }));