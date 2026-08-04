import { Link } from "react-router-dom";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";

import type { GrammarTopic } from "@/api/grammarTopicApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/features/vocabulary/components/StatusBadge";
import { grammarRoutePaths } from "@/features/grammar/routes/grammarRoutes";

interface GrammarTopicCardProps {
  topic: GrammarTopic;
  onEdit: (topic: GrammarTopic) => void;
  onDelete: (topic: GrammarTopic) => void;
  onToggleStatus: (topic: GrammarTopic) => void;
}

export default function GrammarTopicCard({
  topic,
  onEdit,
  onDelete,
  onToggleStatus,
}: GrammarTopicCardProps) {
  return (
    <Card className="card-hover h-full border-border shadow-sm transition-all">
      <CardHeader className="space-y-3 px-5 pt-5">
        <div className="overflow-hidden rounded-2xl">
          {topic.thumbnail ? (
            <img
              src={topic.thumbnail}
              alt={topic.name}
              className="aspect-[16/9] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-50 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-400">
              GRAMMAR
            </div>
          )}
        </div>

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
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 px-5 py-4">
        <Button asChild variant="outline" size="sm">
          <Link to={grammarRoutePaths.topicDetail(topic.slug)}>View</Link>
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
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(topic)}
        >
          {topic.isActive ? (
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
          onClick={() => onDelete(topic)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
