import { BookOpen, LayoutGrid } from "lucide-react";

export const readingRoutePaths = {
  root: "/reading",
  categories: "/reading/categories",
  categoryDetail: (categorySlug: string) =>
    `/reading/categories/${categorySlug}`,
  passageDetail: (passageSlug: string) =>
    `/reading/passages/${passageSlug}`,
} as const;

export const readingNavigationItems = [
  {
    key: "reading-categories",
    label: "Categories",
    icon: LayoutGrid,
    to: readingRoutePaths.categories,
  },
  {
    key: "reading-passages",
    label: "All Passages",
    icon: BookOpen,
    to: readingRoutePaths.root,
  },
] as const;
