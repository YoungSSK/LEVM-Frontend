import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { VocabularyTopic, CreateVocabularyTopicPayload } from "@/features/vocabulary/types";
import { validateTopicForm } from "@/features/vocabulary/schemas/vocabularySchemas";

interface TopicFormSheetProps {
  open: boolean;
  mode: "create" | "edit";
  topic: VocabularyTopic | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateVocabularyTopicPayload) => Promise<void>;
}

export default function TopicFormSheet({
  open,
  mode,
  topic,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: TopicFormSheetProps) {
  const [name, setName] = useState(topic?.name ?? "");
  const [description, setDescription] = useState(topic?.description ?? "");
  const [thumbnail, setThumbnail] = useState(topic?.thumbnail ?? "");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    thumbnail?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateTopicForm({
      name,
      description,
      thumbnail,
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {mode === "create" ? "Thêm topic" : "Sửa topic"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Tạo một topic mới để nhóm các lesson cùng chủ đề."
                : "Cập nhật thông tin topic đang chọn."}
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex h-full flex-col gap-5 px-6 pb-6 pt-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tên topic</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Basic Grammar"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả ngắn về topic"
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
                  alt={name || "Topic thumbnail"}
                  className="mt-2 aspect-[16/9] w-full rounded-2xl object-cover"
                />
              ) : null}
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
                    ? "Thêm topic"
                    : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}