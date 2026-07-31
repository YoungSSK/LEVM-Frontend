import { Edit2, Trash2, Eye, EyeOff, Globe, GlobeLock, Clock, Eye as ViewIcon } from "lucide-react";

import type { GrammarLesson } from "@/api/grammarLessonApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/features/vocabulary/components/StatusBadge";

interface GrammarLessonCardProps {
  lesson: GrammarLesson;
  onView: (lesson: GrammarLesson) => void;
  onEdit: (lesson: GrammarLesson) => void;
  onDelete: (lesson: GrammarLesson) => void;
  onToggleStatus: (lesson: GrammarLesson) => void;
  onTogglePublish: (lesson: GrammarLesson) => void;
}

function LessonThumbnail({
  thumbnail,
  title,
}: {
  thumbnail?: string;
  title: string;
}) {
  if (!thumbnail) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-50 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
        No Image
      </div>
    );
  }

  return (
    <img
      src={thumbnail}
      alt={title}
      className="aspect-[16/9] w-full rounded-2xl object-cover"
    />
  );
}

export default function GrammarLessonCard({
  lesson,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePublish,
}: GrammarLessonCardProps) {
  return (
    <Card className="card-hover flex h-full flex-col border-border shadow-sm transition-all">
      <CardHeader className="space-y-3 px-5 pt-5">
        <LessonThumbnail thumbnail={lesson.thumbnailUrl} title={lesson.title} />

        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg font-semibold" title={lesson.title}>
              {lesson.title}
            </CardTitle>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Order {lesson.order}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {lesson.hasQuiz ? (
              <StatusBadge
                label="Có trắc nghiệm"
                tone="info"
              />
            ) : (
              <StatusBadge
                label="Chưa có trắc nghiệm"
                tone="neutral"
              />
            )}
            <StatusBadge
              label={`${lesson.xpReward ?? 10} XP`}
              tone="warning"
            />
            <StatusBadge
              label={lesson.isActive ? "Hiển thị" : "Đã ẩn"}
              tone={lesson.isActive ? "success" : "neutral"}
            />
            <StatusBadge
              label={lesson.isPublished ? "Đã xuất bản" : "Bản nháp"}
              tone={lesson.isPublished ? "success" : "warning"}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-3 px-5">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {lesson.shortDescription || "Chưa có mô tả."}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-3 rounded-2xl bg-muted/50 p-3 text-sm">
          <div>
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Clock className="size-3" />
              Thời gian
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {lesson.estimatedTime} phút
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-wrap gap-2 border-t border-border/60 px-5 py-4">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => onView(lesson)}
        >
          <ViewIcon className="size-4" />
          Xem chi tiết
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onTogglePublish(lesson)}
        >
          {lesson.isPublished ? (
            <>
              <GlobeLock className="size-4" />
              Gỡ xuất bản
            </>
          ) : (
            <>
              <Globe className="size-4" />
              Xuất bản
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(lesson)}
        >
          <Edit2 className="size-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(lesson)}
        >
          {lesson.isActive ? (
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
          onClick={() => onDelete(lesson)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
