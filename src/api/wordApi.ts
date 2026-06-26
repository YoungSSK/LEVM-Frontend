import axiosClient from "@/api/axiosClient";

export type Difficulty = "easy" | "medium" | "hard";

export interface WordMeaning {
  _id: string;
  wordId: string;

  partOfSpeech:
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "pronoun"
    | "preposition"
    | "conjunction"
    | "interjection"
    | "other";

  meaning: string;

  exampleSentence: string;
  exampleMeaning: string;

  isPrimary: boolean;
  order: number;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface Word {
  _id: string;

  word: string;

  pronunciations: {
    us: string;
    uk: string;
  };

  audioUrls: {
    us: string;
    uk: string;
  };

  imageUrl: string;

  difficulty: Difficulty;

  isActive: boolean;

  meanings?: WordMeaning[];

  createdAt?: string;
  updatedAt?: string;
}

export interface WordPagination {
  words: Word[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateWordPayload {
  word: string;
  meaning: string;

  partOfSpeech:
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "pronoun"
    | "preposition"
    | "conjunction"
    | "interjection"
    | "other";

  difficulty?: Difficulty;
}

export interface UpdateWordPayload {
  word?: string;
  difficulty?: Difficulty;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const wordApi = {
  getAll: (
    page = 1,
    limit = 10,
  ): Promise<WordPagination> =>
    axiosClient
      .get<ApiEnvelope<WordPagination>>(
        `/words?page=${page}&limit=${limit}`,
      )
      .then((res) => res.data.data),

  search: (keyword: string): Promise<Word[]> =>
    axiosClient
      .get<ApiEnvelope<Word[]>>(
        `/words/search?keyword=${encodeURIComponent(keyword)}`,
      )
      .then((res) => res.data.data),

  getById: (id: string): Promise<Word> =>
    axiosClient
      .get<ApiEnvelope<Word>>(`/words/${id}`)
      .then((res) => res.data.data),

  getDetail: (id: string): Promise<any> =>
    axiosClient
      .get<ApiEnvelope<any>>(`/words/${id}/detail`)
      .then((res) => res.data.data),

  create: (payload: CreateWordPayload): Promise<Word> =>
    axiosClient
      .post<ApiEnvelope<Word>>("/words", payload)
      .then((res) => res.data.data),

  update: (
    id: string,
    payload: UpdateWordPayload,
  ): Promise<Word> =>
    axiosClient
      .patch<ApiEnvelope<Word>>(`/words/${id}`, payload)
      .then((res) => res.data.data),

  changeStatus: (
    id: string,
    isActive: boolean,
  ): Promise<Word> =>
    axiosClient
      .patch<ApiEnvelope<Word>>(`/words/${id}/status`, {
        isActive,
      })
      .then((res) => res.data.data),

  remove: (id: string): Promise<void> =>
    axiosClient.delete(`/words/${id}`).then(() => undefined),
};

export default wordApi;