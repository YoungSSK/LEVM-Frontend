import axiosClient from "@/api/axiosClient";

export interface GrammarQuizOptionClient {
  text: string;
  isCorrect?: boolean;
}

export interface GrammarQuizOptionAdmin extends GrammarQuizOptionClient {
  isCorrect: boolean;
}

export interface GrammarQuizQuestionClient {
  _id: string;
  lessonId: string;
  questionText: string;
  options: GrammarQuizOptionClient[];
  order: number;
}

export interface GrammarQuizQuestionAdmin {
  _id: string;
  lessonId: string;
  questionText: string;
  options: GrammarQuizOptionAdmin[];
  explanation: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGrammarQuizQuestionPayload {
  questionText: string;
  options: { text: string; isCorrect?: boolean }[];
  explanation?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateGrammarQuizQuestionPayload {
  questionText?: string;
  options?: { text: string; isCorrect?: boolean }[];
  explanation?: string;
  order?: number;
  isActive?: boolean;
}

export interface QuizOrderItem {
  questionId: string;
  order: number;
}

export interface ImportQuizCsvResult {
  inserted: number;
  failed: number;
  errors: { row: number; message: string }[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const grammarQuizApi = {
  /**
   * Admin: lấy câu hỏi kèm đáp án + giải thích.
   * GET /grammar/lessons/:lessonId/quiz
   */
  list: (lessonId: string): Promise<GrammarQuizQuestionAdmin[]> =>
    axiosClient
      .get<ApiEnvelope<GrammarQuizQuestionAdmin[]>>(
        `/grammar/lessons/${lessonId}/quiz`,
      )
      .then((res) => res.data.data),

  /**
   * POST /grammar/lessons/:lessonId/quiz
   */
  create: (
    lessonId: string,
    payload: CreateGrammarQuizQuestionPayload,
  ): Promise<GrammarQuizQuestionAdmin> =>
    axiosClient
      .post<ApiEnvelope<GrammarQuizQuestionAdmin>>(
        `/grammar/lessons/${lessonId}/quiz`,
        payload,
      )
      .then((res) => res.data.data),

  /**
   * PATCH /grammar/quiz/:questionId
   */
  update: (
    questionId: string,
    payload: UpdateGrammarQuizQuestionPayload,
  ): Promise<GrammarQuizQuestionAdmin> =>
    axiosClient
      .patch<ApiEnvelope<GrammarQuizQuestionAdmin>>(
        `/grammar/quiz/${questionId}`,
        payload,
      )
      .then((res) => res.data.data),

  /**
   * DELETE /grammar/quiz/:questionId
   */
  remove: (questionId: string): Promise<void> =>
    axiosClient
      .delete(`/grammar/quiz/${questionId}`)
      .then(() => undefined),

  /**
   * PATCH /grammar/lessons/:lessonId/quiz/reorder
   */
  reorder: (
    lessonId: string,
    orders: QuizOrderItem[],
  ): Promise<{ updated: number }> =>
    axiosClient
      .patch<
        ApiEnvelope<{ updated: number }>
      >(`/grammar/lessons/${lessonId}/quiz/reorder`, { orders })
      .then((res) => res.data.data),

  /**
   * POST /grammar/lessons/:lessonId/quiz/import-csv (multipart, field=file)
   */
  importCsv: (
    lessonId: string,
    file: File,
  ): Promise<ImportQuizCsvResult> => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<
        ApiEnvelope<ImportQuizCsvResult>
      >(`/grammar/lessons/${lessonId}/quiz/import-csv`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data.data);
  },

  /**
   * GET /grammar/quiz/csv-template -> trả blob để download.
   */
  downloadCsvTemplate: async (): Promise<Blob> => {
    const res = await axiosClient.get<Blob>(
      "/grammar/quiz/csv-template",
      { responseType: "blob" },
    );
    return res.data;
  },

  /**
   * (User/Mobile) POST /grammar/lessons/:lessonId/quiz/submit
   */
  submit: (
    lessonId: string,
    answers: { questionId: string; selectedOptionIndex: number }[],
  ): Promise<SubmitQuizResponse> =>
    axiosClient
      .post<ApiEnvelope<SubmitQuizResponse>>(
        `/grammar/lessons/${lessonId}/quiz/submit`,
        { answers },
      )
      .then((res) => res.data.data),
};

export interface SubmitQuizAnswerResult {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface SubmitQuizResponse {
  lessonId: string;
  score: number;
  passThreshold: number;
  isPassed: boolean;
  result: SubmitQuizAnswerResult[];
  xpEarned: number;
  newXp?: number;
  newStreak?: number;
  longestStreak?: number;
  streakUpdated?: boolean;
  isFirstCompletionToday?: boolean;
  alreadyPassed?: boolean;
}

export default grammarQuizApi;
