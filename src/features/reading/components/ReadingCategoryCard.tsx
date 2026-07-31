import { Link } from "react-router-dom";
import { Edit2, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";

import type { ReadingCategory } from "@/api/readingCategoryApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/features/vocabulary/components/StatusBadge";
import { readingRoutePaths } from "@/features/reading/routes/readingRoutes";

interface ReadingCategoryCardProps {
  category: ReadingCategory;
  onEdit: (category: ReadingCategory) => void;
  onDelete: (category: ReadingCategory) => void;
  onToggleStatus: (category: ReadingCategory) => void;
}

const DEFAULT_COLOR = "#10B981"; // Emerald tone for Reading

export default function ReadingCategoryCard({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
}: ReadingCategoryCardProps) {
  const accentColor = category.color || DEFAULT_COLOR;

  return (
    <Card className="card-hover flex h-full flex-col justify-between border-border shadow-sm transition-all">
      <div>
        {/* Header & Thumbnail Banner */}
        <CardHeader className="space-y-3 px-5 pt-5">
          {category.thumbnail ? (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl">
              <img
                src={category.thumbnail}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ) : (
            <div
              className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-900 text-xs font-semibold uppercase tracking-[0.28em]"
              style={{ color: accentColor }}
            >
              <BookOpen className="mr-2 size-4" />
              READING
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-lg font-semibold">
                {category.name}
              </CardTitle>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Order {category.order}
              </p>
            </div>
            <StatusBadge
              label={category.isActive ? "Đang hoạt động" : "Tạm ẩn"}
              tone={category.isActive ? "success" : "neutral"}
            />
          </div>
        </CardHeader>

        {/* Content & Stats Box */}
        <CardContent className="space-y-3 px-5">
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {category.description || "Chưa có mô tả danh mục."}
          </p>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/50 p-3 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Passages
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {category.passageCount}
              </p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Footer Action Buttons */}
      <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 px-5 py-4">
        <Button asChild variant="outline" size="sm">
          <Link to={readingRoutePaths.categoryDetail(category.slug)}>View</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(category)}
        >
          <Edit2 className="size-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(category)}
        >
          {category.isActive ? (
            <>
              <Eye className="size-4" />
              Ẩn
            </>
          ) : (
            <>
              <EyeOff className="size-4" />
              Hiển thị
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
