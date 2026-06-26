import axiosClient from "@/api/axiosClient";

export interface VocabularyLesson {
  _id: string;

  topicId: string;

  title: string;
  description: string;
  thumbnail: string;

  estimatedTime: number;

  order: number;
  wordCount: number;

  isActive: boolean;

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

  wordId: any;
  wordMeaningId: any;
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
}

export interface UpdateVocabularyLessonPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  estimatedTime?: number;
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
  // GET /vocabulary-topics/:topicId/lessons
  getByTopic: (
    topicId: string,
  ): Promise<VocabularyLesson[]> =>
    axiosClient
      .get<ApiEnvelope<VocabularyLesson[]>>(
        `/vocabulary-topics/${topicId}/lessons`,
      )
      .then((res) => res.data.data),

  // GET /vocabulary-lessons/:id
  getById: (
    id: string,
  ): Promise<VocabularyLesson> =>
    axiosClient
      .get<ApiEnvelope<VocabularyLesson>>(
        `/vocabulary-lessons/${id}`,
      )
      .then((res) => res.data.data),

  // POST /vocabulary-topics/:topicId/lessons
  create: (
    topicId: string,
    payload: CreateVocabularyLessonPayload,
  ): Promise<VocabularyLesson> =>
    axiosClient
      .post<ApiEnvelope<VocabularyLesson>>(
        `/vocabulary-topics/${topicId}/lessons`,
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /vocabulary-lessons/:id
  update: (
    id: string,
    payload: UpdateVocabularyLessonPayload,
  ): Promise<VocabularyLesson> =>
    axiosClient
      .patch<ApiEnvelope<VocabularyLesson>>(
        `/vocabulary-lessons/${id}`,
        payload,
      )
      .then((res) => res.data.data),

  // PATCH /vocabulary-lessons/:id/status
  changeStatus: (
    id: string,
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
      >(`/vocabulary-lessons/${id}/status`)
      .then((res) => res.data.data),

  // DELETE /vocabulary-lessons/:id
  delete: (id: string): Promise<void> =>
    axiosClient
      .delete(`/vocabulary-lessons/${id}`)
      .then(() => undefined),

  // PATCH /vocabulary-topics/:topicId/lessons/order
  changeOrder: (
    topicId: string,
    orders: LessonOrderItem[],
  ): Promise<void> =>
    axiosClient
      .patch(
        `/vocabulary-topics/${topicId}/lessons/order`,
        { orders },
      )
      .then(() => undefined),

  // GET /vocabulary-lessons/:lessonId/words
  getWords: (
    lessonId: string,
  ): Promise<LessonWord[]> =>
    axiosClient
      .get<ApiEnvelope<LessonWord[]>>(
        `/vocabulary-lessons/${lessonId}/words`,
      )
      .then((res) => res.data.data),

  // POST /vocabulary-lessons/:lessonId/words
  addWord: (
    lessonId: string,
    payload: AddWordPayload,
  ): Promise<void> =>
    axiosClient
      .post(
        `/vocabulary-lessons/${lessonId}/words`,
        payload,
      )
      .then(() => undefined),

  // DELETE /vocabulary-lessons/:lessonId/words/:wordId
  removeWord: (
    lessonId: string,
    wordId: string,
  ): Promise<void> =>
    axiosClient
      .delete(
        `/vocabulary-lessons/${lessonId}/words/${wordId}`,
      )
      .then(() => undefined),

  // GET /vocabulary-lessons/:lessonId/study-words
  getStudyWords: (
    lessonId: string,
  ): Promise<StudyWordResponse> =>
    axiosClient
      .get<ApiEnvelope<StudyWordResponse>>(
        `/vocabulary-lessons/${lessonId}/study-words`,
      )
      .then((res) => res.data.data),
};

export default vocabularyLessonApi;