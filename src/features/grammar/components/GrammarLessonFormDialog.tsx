import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PackageAccessSelector from "@/components/PackageAccessSelector";
import type {
  GrammarLesson,
} from "@/api/grammarLessonApi";
import { validateGrammarLessonForm } from "@/features/grammar/schemas/grammarSchemas";

interface GrammarLessonFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  topicId: string;
  topicName: string;
  lesson: GrammarLesson | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    topicId: string;
    title: string;
    shortDescription?: string;
    thumbnailUrl?: string;
    estimatedTime?: number;
    xpReward?: number;
    passThreshold?: number;
    allowedPackageIds?: string[];
  }) => Promise<void>;
}

export default function GrammarLessonFormDialog({
  open,
  mode,
  topicId,
  topicName,
  lesson,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: GrammarLessonFormDialogProps) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    lesson?.shortDescription ?? "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    lesson?.thumbnailUrl ?? "",
  );
  const [estimatedTime, setEstimatedTime] = useState(
    String(lesson?.estimatedTime ?? 0),
  );
  const [xpReward, setXpReward] = useState(
    String(lesson?.xpReward ?? 10),
  );
  const [passThreshold, setPassThreshold] = useState(
    String(lesson?.passThreshold ?? 70),
  );
  const [allowedPackageIds, setAllowedPackageIds] = useState<string[]>(
    (lesson?.allowedPackageIds as any[])?.map((p) => (typeof p === "object" ? p._id : p)) ?? [],
  );
  const [errors, setErrors] = useState<{
    title?: string;
    shortDescription?: string;
    thumbnailUrl?: string;
    estimatedTime?: string;
    xpReward?: string;
    passThreshold?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateGrammarLessonForm({
      topicId,
      title,
      shortDescription,
      thumbnailUrl,
      estimatedTime,
      xpReward,
      passThreshold,
    });

    if (!result.values) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit({ ...result.values, allowedPackageIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm bài học" : "Sửa bài học"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo bài học ngữ pháp mới cho chủ đề đang chọn. Nội dung lý thuyết có thể upload sau."
              : "Cập nhật thông tin bài học."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Chủ đề
            </label>
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {topicName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bài học sẽ được gắn vào chủ đề này.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tiêu đề bài học
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Present Simple — Công thức và cách dùng"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Mô tả ngắn
            </label>
            <Textarea
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              placeholder="Mô tả ngắn gọn nội dung bài học"
              aria-invalid={Boolean(errors.shortDescription)}
            />
            {errors.shortDescription ? (
              <p className="text-xs text-destructive">
                {errors.shortDescription}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Thumbnail URL
            </label>
            <Input
              value={thumbnailUrl}
              onChange={(event) => setThumbnailUrl(event.target.value)}
              placeholder="https://..."
              aria-invalid={Boolean(errors.thumbnailUrl)}
            />
            {errors.thumbnailUrl ? (
              <p className="text-xs text-destructive">
                {errors.thumbnailUrl}
              </p>
            ) : null}

            {thumbnailUrl.trim() ? (
              <img
                src={thumbnailUrl}
                alt={title || "Lesson thumbnail"}
                className="mt-2 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Thời gian ước tính (phút)
            </label>
            <Input
              type="number"
              min={0}
              value={estimatedTime}
              onChange={(event) => setEstimatedTime(event.target.value)}
              placeholder="0"
              aria-invalid={Boolean(errors.estimatedTime)}
            />
            {errors.estimatedTime ? (
              <p className="text-xs text-destructive">
                {errors.estimatedTime}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                XP thưởng
              </label>
              <Input
                type="number"
                min={0}
                max={1000}
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                placeholder="10"
                aria-invalid={Boolean(errors.xpReward)}
                className="text-sm"
              />
              {errors.xpReward ? (
                <p className="text-xs text-destructive">{errors.xpReward}</p>
              ) : null}
              <p className="text-[10px] text-muted-foreground">
                Mặc định 10, tối đa 1000
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Ngưỡng đạt (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passThreshold}
                onChange={(e) => setPassThreshold(e.target.value)}
                placeholder="70"
                aria-invalid={Boolean(errors.passThreshold)}
                className="text-sm"
              />
              {errors.passThreshold ? (
                <p className="text-xs text-destructive">{errors.passThreshold}</p>
              ) : null}
              <p className="text-[10px] text-muted-foreground">
                Mặc định 70%, tối đa 100%
              </p>
            </div>
          </div>

          <PackageAccessSelector
            value={allowedPackageIds}
            onChange={setAllowedPackageIds}
            disabled={isSubmitting}
          />

          <div className="flex gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang lưu..."
                : mode === "create"
                  ? "Thêm bài học"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
