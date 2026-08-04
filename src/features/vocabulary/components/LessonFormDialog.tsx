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
import ImageUploadInput from "@/components/ImageUploadInput";
import type { VocabularyLesson } from "@/features/vocabulary/types";
import { validateLessonForm } from "@/features/vocabulary/schemas/vocabularySchemas";

interface LessonFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  topicSlug: string;
  topicName: string;
  lesson: VocabularyLesson | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    description?: string;
    thumbnail?: string;
    estimatedTime?: number;
    xpReward?: number;
    allowedPackageIds?: string[];
  }) => Promise<void>;
}

export default function LessonFormDialog({
  open,
  mode,
  topicSlug,
  topicName,
  lesson,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: LessonFormDialogProps) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [thumbnail, setThumbnail] = useState(lesson?.thumbnail ?? "");
  const [estimatedTime, setEstimatedTime] = useState(
    String(lesson?.estimatedTime ?? 0),
  );
  const [xpReward, setXpReward] = useState(
    String(lesson?.xpReward ?? 10),
  );
  const [allowedPackageIds, setAllowedPackageIds] = useState<string[]>(
    (lesson?.allowedPackageIds as any[])?.map((p) => (typeof p === "object" ? p._id : p)) ?? [],
  );
  const [errors, setErrors] = useState<{
    topicSlug?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    estimatedTime?: string;
    xpReward?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateLessonForm({
      topicSlug,
      title,
      description,
      thumbnail,
      estimatedTime,
      xpReward,
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
            {mode === "create" ? "Thêm lesson" : "Sửa lesson"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo lesson mới cho topic đang chọn."
              : "Cập nhật thông tin lesson."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Topic
            </label>
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {topicName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lesson sẽ được gắn vào topic này.
              </p>
            </div>
            {errors.topicSlug ? (
              <p className="text-xs text-destructive">{errors.topicSlug}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Present Simple"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả lesson"
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : null}
          </div>

          <ImageUploadInput
            value={thumbnail}
            onChange={setThumbnail}
            label="Ảnh Thumbnail Lesson"
            placeholder="Dán URL ảnh hoặc chọn file từ máy..."
            error={errors.thumbnail}
            disabled={isSubmitting}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Estimated Time (phút)
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              XP thưởng (khi hoàn thành bài học)
            </label>
            <Input
              type="number"
              min={0}
              max={1000}
              value={xpReward}
              onChange={(event) => setXpReward(event.target.value)}
              placeholder="10"
              aria-invalid={Boolean(errors.xpReward)}
            />
            {errors.xpReward ? (
              <p className="text-xs text-destructive">{errors.xpReward}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Mặc định 10 XP, tối đa 1000.
            </p>
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
                  ? "Thêm lesson"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
