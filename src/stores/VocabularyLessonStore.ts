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
    topicSlug: string,
  ) => Promise<void>;

  fetchById: (
    lessonSlug: string,
  ) => Promise<void>;

  create: (
    topicSlug: string,
    payload: CreateVocabularyLessonPayload,
  ) => Promise<void>;

  update: (
    lessonSlug: string,
    payload: UpdateVocabularyLessonPayload,
  ) => Promise<void>;

  changeStatus: (
    lessonSlug: string,
  ) => Promise<void>;

  remove: (
    lessonSlug: string,
  ) => Promise<void>;

  changeOrder: (
    topicSlug: string,
    orders: LessonOrderItem[],
  ) => Promise<void>;

  fetchWords: (
    lessonSlug: string,
  ) => Promise<void>;

  addWord: (
    lessonSlug: string,
    payload: AddWordPayload,
  ) => Promise<void>;

  removeWord: (
    lessonSlug: string,
    wordId: string,
  ) => Promise<void>;

  fetchStudyWords: (
    lessonSlug: string,
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

    fetchByTopic: async (topicSlug) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const lessons =
          await vocabularyLessonApi.getByTopic(
            topicSlug,
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

    fetchById: async (lessonSlug) => {
      const lesson =
        await vocabularyLessonApi.getById(
          lessonSlug,
        );

      set({
        selectedLesson: lesson,
      });
    },

    create: async (
      topicSlug,
      payload,
    ) => {
      const lesson =
        await vocabularyLessonApi.create(
          topicSlug,
          payload,
        );

      set({
        lessons: [...get().lessons, lesson],
      });
    },

    update: async (
      lessonSlug,
      payload,
    ) => {
      const updated =
        await vocabularyLessonApi.update(
          lessonSlug,
          payload,
        );

      set({
        lessons: get().lessons.map((lesson) =>
          lesson._id === updated._id
            ? updated
            : lesson,
        ),
      });
    },

    changeStatus: async (lessonSlug) => {
      const result =
        await vocabularyLessonApi.changeStatus(
          lessonSlug,
        );

      set({
        lessons: get().lessons.map((lesson) =>
          lesson._id === result.lessonId
            ? {
                ...lesson,
                isActive: result.isActive,
              }
            : lesson,
        ),
      });
    },

    remove: async (lessonSlug) => {
      const targetId = lessonSlug;

      await vocabularyLessonApi.delete(lessonSlug);

      set({
        lessons: get().lessons.filter(
          (lesson) => lesson._id !== targetId && lesson.slug !== targetId,
        ),
      });
    },

    changeOrder: async (
      topicSlug,
      orders,
    ) => {
      await vocabularyLessonApi.changeOrder(
        topicSlug,
        orders,
      );

      await get().fetchByTopic(topicSlug);
    },

    fetchWords: async (lessonSlug) => {
      const words =
        await vocabularyLessonApi.getWords(
          lessonSlug,
        );

      set({
        words,
      });
    },

    addWord: async (
      lessonSlug,
      payload,
    ) => {
      await vocabularyLessonApi.addWord(
        lessonSlug,
        payload,
      );
    },

    removeWord: async (
      lessonSlug,
      wordId,
    ) => {
      await vocabularyLessonApi.removeWord(
        lessonSlug,
        wordId,
      );
    },

    fetchStudyWords: async (lessonSlug) => {
      const result =
        await vocabularyLessonApi.getStudyWords(
          lessonSlug,
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
