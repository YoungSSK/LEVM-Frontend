import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { VocabularyLesson } from "@/features/vocabulary/types";
import { validateLessonForm } from "@/features/vocabulary/schemas/vocabularySchemas";

interface LessonFormSheetProps {
  open: boolean;
  mode: "create" | "edit";
  topicId: string;
  topicName: string;
  lesson: VocabularyLesson | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    topicId: string;
    title: string;
    description?: string;
    thumbnail?: string;
    order: number;
    isPublished: boolean;
  }) => Promise<void>;
}

export default function LessonFormSheet({
  open,
  mode,
  topicId,
  topicName,
  lesson,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: LessonFormSheetProps) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [thumbnail, setThumbnail] = useState(lesson?.thumbnail ?? "");
  const [order, setOrder] = useState(String(lesson?.order ?? 0));
  const [isPublished, setIsPublished] = useState(lesson?.isPublished ?? true);
  const [errors, setErrors] = useState<{
    topicId?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    order?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateLessonForm({
      topicId,
      title,
      description,
      thumbnail,
      order,
      isPublished,
    });

    if (!result.values) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {mode === "create" ? "Thêm lesson" : "Sửa lesson"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Tạo lesson mới cho topic đang chọn."
                : "Cập nhật thông tin lesson."}
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex h-full flex-col gap-5 px-6 pb-6 pt-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label>
              <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{topicName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lesson sẽ được gắn vào topic này.
                </p>
              </div>
              {errors.topicId ? (
                <p className="text-xs text-destructive">{errors.topicId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Thumbnail URL
              </label>
              <Input
                value={thumbnail}
                onChange={(event) => setThumbnail(event.target.value)}
                placeholder="https://..."
                aria-invalid={Boolean(errors.thumbnail)}
              />
              {errors.thumbnail ? (
                <p className="text-xs text-destructive">{errors.thumbnail}</p>
              ) : null}

              {thumbnail.trim() ? (
                <img
                  src={thumbnail}
                  alt={title || "Lesson thumbnail"}
                  className="mt-2 aspect-[16/9] w-full rounded-2xl object-cover"
                />
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Order</label>
                <Input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.order)}
                />
                {errors.order ? (
                  <p className="text-xs text-destructive">{errors.order}</p>
                ) : null}
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(event) => setIsPublished(event.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Published</span>
              </label>
            </div>

            <div className="mt-auto flex gap-2 border-t border-border pt-4">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
