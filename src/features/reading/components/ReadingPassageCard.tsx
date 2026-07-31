import { BookOpen, Copy, Pencil, Trash2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReadingPassage, ReadingPassageStatus } from "@/api/readingPassageApi";
import ReadingPassageStatusBadge from "./ReadingPassageStatusBadge";

interface ReadingPassageCardProps {
  passage: ReadingPassage;
  onView: () => void;
  onEdit: (passage: ReadingPassage) => void;
  onDelete: (passage: ReadingPassage) => void;
  onChangeStatus: (passage: ReadingPassage, status: ReadingPassageStatus) => void;
  onClone: (passage: ReadingPassage) => void;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  elementary: "Elementary",
  intermediate: "Intermediate",
  upper_intermediate: "Upper Int.",
  advanced: "Advanced",
};

export default function ReadingPassageCard({
  passage,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  onClone,
}: ReadingPassageCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <ReadingPassageStatusBadge status={passage.status} />
            <Badge variant="outline" className="text-[10px]">
              {passage.cefrLevel || "B1"}
            </Badge>
            <Badge variant="secondary" className="text-[10px] capitalize">
              {DIFFICULTY_LABELS[passage.difficulty] || passage.difficulty}
            </Badge>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <HelpCircle className="size-3.5" />
                <span className={passage.hasQuestions ? "text-emerald-600 font-medium" : ""}>
                  {passage.hasQuestions ? "Có câu hỏi" : "Chưa có"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {passage.hasQuestions
                ? "Bài đọc đã có câu hỏi trắc nghiệm"
                : "Chưa tạo câu hỏi cho bài đọc này"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Title & Description */}
        <div>
          <h3
            onClick={onView}
            className="cursor-pointer font-heading text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {passage.title}
          </h3>
          {passage.description ? (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {passage.description}
            </p>
          ) : null}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-muted/40 p-2.5 text-center text-xs">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Số từ</p>
            <p className="font-semibold text-foreground">{passage.wordCount || 0}</p>
          </div>
          <div className="border-x border-border">
            <p className="text-[10px] uppercase text-muted-foreground">Thời gian</p>
            <p className="font-semibold text-foreground">{passage.estimatedTime || 0}m</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Thưởng</p>
            <p className="font-semibold text-emerald-600">{passage.xpReward || 15} XP</p>
          </div>
        </div>

        {/* Tags */}
        {passage.tags && passage.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {passage.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {passage.tags.length > 3 ? (
              <span className="text-[10px] text-muted-foreground">
                +{passage.tags.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <Button size="sm" onClick={onView} className="gap-1.5 text-xs">
          <BookOpen className="size-3.5" />
          Chi tiết
        </Button>

        <div className="flex items-center gap-1">
          <Select
            value={passage.status}
            onValueChange={(val) => onChangeStatus(passage, val as ReadingPassageStatus)}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="published">Xuất bản</SelectItem>
              <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => onEdit(passage)}
              >
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chỉnh sửa metadata</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => onClone(passage)}
              >
                <Copy className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sao chép bài đọc</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(passage)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa bài đọc</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
