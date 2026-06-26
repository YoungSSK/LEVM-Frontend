import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";

import type { VocabularyTopic } from "@/features/vocabulary/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/features/vocabulary/components/StatusBadge";
import { vocabularyRoutePaths } from "@/features/vocabulary/routes/vocabularyRoutes";

interface TopicCardProps {
  topic: VocabularyTopic;
  onEdit: (topic: VocabularyTopic) => void;
  onDelete: (topic: VocabularyTopic) => void;
}

function TopicThumbnail({ thumbnail, name }: { thumbnail: string; name: string }) {
  if (!thumbnail) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        No Image
      </div>
    );
  }

  return (
    <img
      src={thumbnail}
      alt={name}
      className="aspect-[16/9] w-full rounded-2xl object-cover"
    />
  );
}

export default function TopicCard({
  topic,
  onEdit,
  onDelete,
}: TopicCardProps) {
  return (
    <Card className="card-hover h-full border-border shadow-sm transition-all">
      <CardHeader className="space-y-3 px-5 pt-5">
        <TopicThumbnail thumbnail={topic.thumbnail} name={topic.name} />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg font-semibold">
              {topic.name}
            </CardTitle>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Order {topic.order}
            </p>
          </div>
          <StatusBadge
            label={topic.isActive ? "Đang hoạt động" : "Tạm ẩn"}
            tone={topic.isActive ? "success" : "neutral"}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {topic.description || "Chưa có mô tả."}
        </p>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/50 p-3 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Lessons
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {topic.lessonCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Words
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {topic.wordCount}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 px-5 py-4">
        <Button asChild variant="outline" size="sm">
          <Link to={vocabularyRoutePaths.topicDetail(topic._id)}>View</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(topic)}
        >
          <Edit2 className="size-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(topic)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
