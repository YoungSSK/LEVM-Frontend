import { BookOpenText, LayoutGrid } from "lucide-react";

export const vocabularyRoutePaths = {
  root: "/vocabulary",
  topics: "/vocabulary/topics",
  topicDetail: (topicSlug: string) => `/vocabulary/topics/${topicSlug}`,
  lessons: "/vocabulary/lessons",
  lessonDetail: (lessonSlug: string) => `/vocabulary/lessons/${lessonSlug}`,
  words: "/vocabulary/words",
  wordDetail: (wordSlug: string) => `/vocabulary/words/${wordSlug}`,
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
