import { FileText, LayoutGrid } from "lucide-react";

export const grammarRoutePaths = {
  root: "/grammar",
  topics: "/grammar/topics",
  topicDetail: (topicSlug: string) => `/grammar/topics/${topicSlug}`,
  lessonDetail: (topicSlug: string, lessonSlug: string) =>
    `/grammar/topics/${topicSlug}/lessons/${lessonSlug}`,
} as const;

export const grammarNavigationItems = [
  {
    key: "grammar-topics",
    label: "Topics",
    icon: LayoutGrid,
    to: grammarRoutePaths.topics,
  },
  {
    key: "grammar-exercises",
    label: "Exercises",
    icon: FileText,
    to: grammarRoutePaths.root,
  },
] as const;
