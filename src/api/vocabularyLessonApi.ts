import axiosClient from "@/api/axiosClient";

export interface VocabularyLesson {
  _id: string;

  topicId: string;

  title: string;
  slug: string;
  description: string;
  thumbnail: string;

  estimatedTime: number;

  order: number;
  wordCount: number;

  isActive: boolean;

  /** XP cộng khi user hoàn thành lesson (Admin chỉnh được). */
  xpReward: number;

  /** Danh sách ID gói thành viên được phép truy cập (rỗng = Free) */
  allowedPackageIds?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface LessonOrderItem {
  lessonId: string;
  order: number;
}

export interface LessonWord {
  _id: string;
  lessonId: string;

  wordId: string;
  wordMeaningId: string;
}

export interface StudyWordResponse {
  lesson: {
    _id: string;
    title: string;
    description: string;
    estimatedTime: number;

    topicId: string;
    topicName: string;
  };

  totalWords: number;

  words: {
    lessonWordId: string;

    wordId: string;
    word: string;

    pronunciations: string[];
    audioUrls: string[];

    imageUrl: string;
    difficulty: string;

    meaningId: string;
    meaning: string;

    partOfSpeech: string;

    exampleSentence: string;
    exampleMeaning: string;

    isPrimary: boolean;
    order: number;
  }[];
}

export interface CreateVocabularyLessonPayload {
  title: string;
  description?: string;
  thumbnail?: string;
  estimatedTime?: number;
  xpReward?: number;
  allowedPackageIds?: string[];
}

export interface UpdateVocabularyLessonPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  estimatedTime?: number;
  xpReward?: number;
  allowedPackageIds?: string[];
}

export interface AddWordPayload {
  wordId: string;
  wordMeaningId: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const vocabularyLessonApi = {
  // GET /vocabulary-topics/:topicSlug/lessons
  getByTopic: (
    topicSlug: string,
  ): Promise<VocabularyLesson[]> =>
    axiosClient
      .get<ApiEnvelope<VocabularyLesson[]>>(
        `/vocabulary-topics/${topicSlug}/lessons`,
      )
      .then((res) => res.data.data),

  // GET /vocabulary-lessons/:lessonSlug
  getById: (
    lessonSlug: string,
  ): Promise<VocabularyLesson> =>
    axiosClient
      .get<ApiEnvelope<VocabularyLesson>>(
        `/vocabulary-lessons/${lessonSlug}`,
      )
      .then((res) => res.data.data),

  // POST /vocabulary-topics/:topicSlug/lessons
  create: (
    topicSlug: string,
    payload: CreateVocabularyLessonPayload,
  ): Promise<VocabularyLesson> =>
    axiosClient
      .post<ApiEnvelope<VocabularyLesson>>(
        `/vocabulary-topics/${topicSlug}/lessons`,
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /vocabulary-lessons/:lessonSlug
  update: (
    lessonSlug: string,
    payload: UpdateVocabularyLessonPayload,
  ): Promise<VocabularyLesson> =>
    axiosClient
      .patch<ApiEnvelope<VocabularyLesson>>(
        `/vocabulary-lessons/${lessonSlug}`,
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /vocabulary-lessons/:lessonSlug/status
  changeStatus: (
    lessonSlug: string,
  ): Promise<{
    lessonId: string;
    isActive: boolean;
  }> =>
    axiosClient
      .patch<
        ApiEnvelope<{
          lessonId: string;
          isActive: boolean;
        }>
      >(`/vocabulary-lessons/${lessonSlug}/status`)
      .then((res) => res.data.data),

  // DELETE /vocabulary-lessons/:lessonSlug
  delete: (lessonSlug: string): Promise<void> =>
    axiosClient
      .delete(`/vocabulary-lessons/${lessonSlug}`)
      .then(() => undefined),

  // PATCH /vocabulary-topics/:topicSlug/lessons/order
  changeOrder: (
    topicSlug: string,
    orders: LessonOrderItem[],
  ): Promise<void> =>
    axiosClient
      .patch(
        `/vocabulary-topics/${topicSlug}/lessons/order`,
        { orders },
      )
      .then(() => undefined),

  // GET /vocabulary-lessons/:lessonSlug/words
  getWords: (
    lessonSlug: string,
  ): Promise<LessonWord[]> =>
    axiosClient
      .get<ApiEnvelope<LessonWord[]>>(
        `/vocabulary-lessons/${lessonSlug}/words`,
      )
      .then((res) => res.data.data),

  // POST /vocabulary-lessons/:lessonSlug/words
  addWord: (
    lessonSlug: string,
    payload: AddWordPayload,
  ): Promise<void> =>
    axiosClient
      .post(
        `/vocabulary-lessons/${lessonSlug}/words`,
        payload,
      )
      .then(() => undefined),

  // DELETE /vocabulary-lessons/:lessonSlug/words/:wordId
  removeWord: (
    lessonSlug: string,
    wordId: string,
  ): Promise<void> =>
    axiosClient
      .delete(
        `/vocabulary-lessons/${lessonSlug}/words/${wordId}`,
      )
      .then(() => undefined),

  // GET /vocabulary-lessons/:lessonSlug/study-words
  getStudyWords: (
    lessonSlug: string,
  ): Promise<StudyWordResponse> =>
    axiosClient
      .get<ApiEnvelope<StudyWordResponse>>(
        `/vocabulary-lessons/${lessonSlug}/study-words`,
      )
      .then((res) => res.data.data),
};

export default vocabularyLessonApi;