import axiosClient from "@/api/axiosClient";

// ===== Types =====

export type ReadingQuestionType =
  | "multiple_choice"
  | "multiple_answer"
  | "true_false"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_heading"
  | "matching_information"
  | "matching_feature"
  | "matching_sentence_ending"
  | "sentence_completion"
  | "summary_completion"
  | "note_completion"
  | "table_completion"
  | "flow_chart_completion"
  | "diagram_completion"
  | "short_answer"
  | "fill_in_blank";

export interface QuestionOption {
  key: string;
  text: string;
  isCorrect?: boolean; // Ẩn với Mobile, có với Admin
}

export interface MatchingItem {
  id: string;
  text: string;
}

export interface CorrectMatch {
  leftId: string;
  rightId: string;
}

export interface ReadingQuestion {
  _id: string;
  questionSetId: string;
  passageId: string;
  questionText: string;
  questionType: ReadingQuestionType;
  contextText?: string;
  locationInPassage?: string;
  order: number;
  points: number;
  isActive: boolean;
  explanation?: string;
  wordLimit?: number | null;
  caseSensitive?: boolean;
  // Answer fields — present when includeAnswers=true (Admin)
  options?: QuestionOption[];
  leftItems?: MatchingItem[];
  rightItems?: MatchingItem[];
  correctMatches?: CorrectMatch[];
  correctAnswer?: string | string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingQuestionSet {
  _id: string;
  passageId: string;
  title: string;
  setType: "practice" | "quiz" | "mini_test" | "exam";
  description?: string;
  order: number;
  questionCount: number;
  isActive: boolean;
  xpReward?: number | null;
  passThreshold?: number | null;
  timeLimit?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReadingQuestionPayload {
  questionText: string;
  questionType: ReadingQuestionType;
  contextText?: string;
  options?: QuestionOption[];
  leftItems?: MatchingItem[];
  rightItems?: MatchingItem[];
  correctMatches?: CorrectMatch[];
  correctAnswer?: string | string[] | null;
  wordLimit?: number | null;
  caseSensitive?: boolean;
  explanation?: string;
  locationInPassage?: string;
  order?: number;
  points?: number;
}

export type UpdateReadingQuestionPayload = Partial<
  CreateReadingQuestionPayload & { isActive: boolean }
>;

export interface ReorderItem {
  questionId: string;
  order: number;
}

export interface CsvPreviewResult {
  total: number;
  validCount: number;
  errorCount: number;
  valid: { row: number; data: Partial<ReadingQuestion> }[];
  errors: { row: number; message: string }[];
}

export interface ImportResult {
  inserted: number;
  failed: number;
  errors: { row: number; message: string }[];
  total: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ===== API Object =====

const readingQuestionApi = {
  // --- Question Sets ---

  getSetsByPassage: async (passageId: string): Promise<ReadingQuestionSet[]> => {
    const res = await axiosClient.get<ApiEnvelope<ReadingQuestionSet[]>>(
      `/reading-questions/passage/${passageId}/sets`,
    );
    return res.data.data;
  },

  // --- Questions ---

  getBySet: async (
    setId: string,
    options: { includeAnswers?: boolean } = {},
  ): Promise<ReadingQuestion[]> => {
    const url = options.includeAnswers
      ? `/reading-questions/set/${setId}/admin`
      : `/reading-questions/set/${setId}`;
    const res = await axiosClient.get<ApiEnvelope<ReadingQuestion[]>>(url);
    return res.data.data;
  },

  create: async (
    setId: string,
    payload: CreateReadingQuestionPayload,
  ): Promise<ReadingQuestion> => {
    const res = await axiosClient.post<ApiEnvelope<ReadingQuestion>>(
      `/reading-questions/set/${setId}`,
      payload,
    );
    return res.data.data;
  },

  update: async (
    questionId: string,
    payload: UpdateReadingQuestionPayload,
  ): Promise<ReadingQuestion> => {
    const res = await axiosClient.patch<ApiEnvelope<ReadingQuestion>>(
      `/reading-questions/${questionId}`,
      payload,
    );
    return res.data.data;
  },

  delete: async (questionId: string): Promise<void> => {
    await axiosClient.delete(`/reading-questions/${questionId}`);
  },

  reorder: async (setId: string, orders: ReorderItem[]): Promise<{ updated: number }> => {
    const res = await axiosClient.patch<ApiEnvelope<{ updated: number }>>(
      `/reading-questions/set/${setId}/reorder`,
      { orders },
    );
    return res.data.data;
  },

  // --- CSV ---

  previewCsv: async (setId: string, file: File): Promise<CsvPreviewResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post<ApiEnvelope<CsvPreviewResult>>(
      `/reading-questions/set/${setId}/preview-csv`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  importCsv: async (setId: string, file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post<ApiEnvelope<ImportResult>>(
      `/reading-questions/set/${setId}/import-csv`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  exportCsv: async (setId: string): Promise<Blob> => {
    const res = await axiosClient.get(
      `/reading-questions/set/${setId}/export-csv`,
      { responseType: "blob" },
    );
    return res.data as Blob;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const res = await axiosClient.get("/reading-questions/template", {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};

export default readingQuestionApi;
