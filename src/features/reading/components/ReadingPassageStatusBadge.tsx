import { Badge } from "@/components/ui/badge";
import type { ReadingPassageStatus } from "@/api/readingCategoryApi";

interface ReadingPassageStatusBadgeProps {
  status: ReadingPassageStatus;
  className?: string;
}

export default function ReadingPassageStatusBadge({
  status,
  className = "",
}: ReadingPassageStatusBadgeProps) {
  switch (status) {
    case "published":
      return (
        <Badge
          variant="default"
          className={`bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400 ${className}`}
        >
          Đã xuất bản
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="outline" className={`text-muted-foreground ${className}`}>
          Bản nháp
        </Badge>
      );
    case "archived":
      return (
        <Badge
          variant="secondary"
          className={`bg-amber-500/15 text-amber-600 dark:text-amber-400 ${className}`}
        >
          Đã lưu trữ
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
