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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GrammarLesson, LessonType } from "@/api/grammarLessonApi";
import { validateGrammarLessonForm } from "@/features/grammar/schemas/grammarSchemas";

interface GrammarLessonFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  topicId: string;
  topicName: string;
  lesson: GrammarLesson | null;
  theoryLessons: GrammarLesson[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    topicId: string;
    title: string;
    shortDescription?: string;
    htmlContent?: string;
    thumbnailUrl?: string;
    estimatedTime?: number;
    lessonType?: LessonType;
    parentLessonId?: string | null;
  }) => Promise<void>;
}

export default function GrammarLessonFormDialog({
  open,
  mode,
  topicId,
  topicName,
  lesson,
  theoryLessons,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: GrammarLessonFormDialogProps) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    lesson?.shortDescription ?? "",
  );
  const [htmlContent, setHtmlContent] = useState(
    lesson?.htmlContent ?? "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    lesson?.thumbnailUrl ?? "",
  );
  const [estimatedTime, setEstimatedTime] = useState(
    String(lesson?.estimatedTime ?? 0),
  );
  const [lessonType, setLessonType] = useState<LessonType>(
    lesson?.lessonType ?? "theory",
  );
  const [parentLessonId, setParentLessonId] = useState(
    lesson?.parentLessonId ?? "",
  );
  const [errors, setErrors] = useState<{
    title?: string;
    shortDescription?: string;
    htmlContent?: string;
    thumbnailUrl?: string;
    estimatedTime?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateGrammarLessonForm({
      topicId,
      title,
      shortDescription,
      htmlContent,
      thumbnailUrl,
      estimatedTime,
      lessonType,
      parentLessonId,
    });

    if (!result.values) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.values);
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
              ? "Tạo bài học ngữ pháp mới cho chủ đề đang chọn."
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
              Loại bài học
            </label>
            <Select
              value={lessonType}
              onValueChange={(value) => {
                setLessonType(value as LessonType);
                if (value === "theory") {
                  setParentLessonId("");
                }
              }}
            >
              <SelectTrigger aria-invalid={false}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theory">Lý thuyết</SelectItem>
                <SelectItem value="exercise">Bài tập</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lessonType === "exercise" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Bài lý thuyết cha
              </label>
              <Select
                value={parentLessonId}
                onValueChange={(value) => setParentLessonId(value)}
              >
                <SelectTrigger aria-invalid={false}>
                  <SelectValue placeholder="Chọn bài lý thuyết..." />
                </SelectTrigger>
                <SelectContent>
                  {theoryLessons.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Chưa có bài lý thuyết nào
                    </SelectItem>
                  ) : (
                    theoryLessons.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Bài tập sẽ được gắn vào bài lý thuyết đã chọn.
              </p>
            </div>
          )}

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
              Nội dung HTML
            </label>
            <Textarea
              value={htmlContent}
              onChange={(event) => setHtmlContent(event.target.value)}
              placeholder="Nhập nội dung bài học dạng HTML..."
              className="min-h-[120px] font-mono text-xs"
              aria-invalid={Boolean(errors.htmlContent)}
            />
            {errors.htmlContent ? (
              <p className="text-xs text-destructive">
                {errors.htmlContent}
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
