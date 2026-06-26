import axiosClient from "@/api/axiosClient";

export interface WordMeaning {
  _id: string;

  wordId:
    | string
    | {
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
        difficulty: "easy" | "medium" | "hard";
        isActive: boolean;
      };

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
  isActive: boolean;

  order: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeaningPayload {
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

  exampleSentence?: string;
  exampleMeaning?: string;

  order?: number;

  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateMeaningPayload {
  partOfSpeech?: WordMeaning["partOfSpeech"];

  meaning?: string;

  exampleSentence?: string;
  exampleMeaning?: string;

  order?: number;

  isPrimary?: boolean;
  isActive?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const wordMeaningApi = {
  getById: (id: string): Promise<WordMeaning> =>
    axiosClient
      .get<ApiEnvelope<WordMeaning>>(`/word-meanings/${id}`)
      .then((res) => res.data.data),

  getByWord: (wordId: string): Promise<WordMeaning[]> =>
    axiosClient
      .get<ApiEnvelope<WordMeaning[]>>(
        `/words/${wordId}/meanings`,
      )
      .then((res) => res.data.data),

  create: (
    wordId: string,
    payload: CreateMeaningPayload,
  ): Promise<WordMeaning> =>
    axiosClient
      .post<ApiEnvelope<WordMeaning>>(
        `/words/${wordId}/meanings`,
        payload,
      )
      .then((res) => res.data.data),

  update: (
    id: string,
    payload: UpdateMeaningPayload,
  ): Promise<WordMeaning> =>
    axiosClient
      .patch<ApiEnvelope<WordMeaning>>(
        `/word-meanings/${id}`,
        payload,
      )
      .then((res) => res.data.data),

  setPrimary: (
    wordId: string,
    meaningId: string,
  ): Promise<WordMeaning> =>
    axiosClient
      .patch<ApiEnvelope<WordMeaning>>(
        `/words/${wordId}/meanings/${meaningId}/primary`,
      )
      .then((res) => res.data.data),

  changeStatus: (
    id: string,
    isActive: boolean,
  ): Promise<WordMeaning> =>
    axiosClient
      .patch<ApiEnvelope<WordMeaning>>(
        `/word-meanings/${id}/status`,
        {
          isActive,
        },
      )
      .then((res) => res.data.data),

  remove: (id: string): Promise<void> =>
    axiosClient
      .delete(`/word-meanings/${id}`)
      .then(() => undefined),
};

export default wordMeaningApi;