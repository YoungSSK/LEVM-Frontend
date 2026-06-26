import { BookOpenText, LayoutGrid } from "lucide-react";

export const vocabularyRoutePaths = {
  root: "/vocabulary",
  topics: "/vocabulary/topics",
  topicDetail: (topicId: string) => `/vocabulary/topics/${topicId}`,
  lessons: "/vocabulary/lessons",
  lessonDetail: (lessonId: string) => `/vocabulary/lessons/${lessonId}`,
  words: "/vocabulary/words",
  wordDetail: (wordId: string) => `/vocabulary/words/${wordId}`,
} as const;

export const vocabularyNavigationItems = [
  {
    key: "topics",
    label: "Topics",
    icon: LayoutGrid,
    to: vocabularyRoutePaths.topics,
  },
  {
    key: "words",
    label: "Words",
    icon: BookOpenText,
    to: vocabularyRoutePaths.words,
  },
] as const;
