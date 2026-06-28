import type { VocabularyLesson as ApiLesson } from "@/api/vocabularyLessonApi";
import type { VocabularyTopic as ApiTopic } from "@/api/vocabularyTopicApi";
import type { Word as ApiWord } from "@/api/wordApi";
import type { WordMeaning as ApiMeaning } from "@/api/wordMeaningApi";

export type VocabularyTopic = ApiTopic;
export type VocabularyLesson = ApiLesson;
export type VocabularyWord = ApiWord & {
  meaningPreview?: string;
  meaningCount?: number;
};
export type VocabularyMeaning = ApiMeaning;

export interface VocabularyLessonWordRelation {
  _id: string;
  lessonId: string;
  wordId: string;
  meaningId: string;
  word?: {
    _id: string;
    word: string;
    pronunciations?: {
      us: string;
      uk: string;
    };
    audioUrls?: {
      us: string;
      uk: string;
    };
  };
  meaning?: {
    _id: string;
    partOfSpeech: string;
    meaning: string;
    exampleSentence?: string;
    exampleMeaning?: string;
  };
}

export interface CreateVocabularyTopicPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateVocabularyTopicPayload {
  name?: string;
  description?: string;
  thumbnail?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateVocabularyLessonPayload {
  title: string;
  description?: string;
  thumbnail?: string;
  estimatedTime?: number;
  order?: number;
  topicId?: string;
  isActive?: boolean;
}

export interface UpdateVocabularyLessonPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  estimatedTime?: number;
  order?: number;
}

export interface CreateVocabularyWordPayload {
  word: string;
  difficulty?: import("@/api/wordApi").Difficulty;
  pronunciations?: {
    us?: string;
    uk?: string;
  };
  audioUrls?: {
    us?: string;
    uk?: string;
  };
  imageUrl?: string;
  meanings?: {
    partOfSpeech: string;
    meaning: string;
    exampleSentence?: string;
  }[];
}

export interface UpdateVocabularyWordPayload {
  word?: string;
  difficulty?: import("@/api/wordApi").Difficulty;
  pronunciations?: {
    us?: string;
    uk?: string;
  };
  audioUrls?: {
    us?: string;
    uk?: string;
  };
  imageUrl?: string;
}

export interface CreateVocabularyWordMeaningPayload {
  partOfSpeech: string;
  meaning: string;
  example?: string;
}

export interface AddWordToLessonPayload {
  lessonId: string;
  wordId: string;
  meaningId: string;
}

export interface CreateVocabularyMeaningPayload {
  partOfSpeech: string;
  meaning: string;
  example?: string;
}
