import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReadingCategory } from "@/api/readingCategoryApi";
import { validateReadingCategoryForm } from "@/features/reading/schemas/readingSchemas";

interface ReadingCategoryFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  category: ReadingCategory | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    description?: string;
    thumbnail?: string;
    color?: string;
    order?: number;
  }) => Promise<void>;
}

export default function ReadingCategoryFormDialog({
  open,
  mode,
  category,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ReadingCategoryFormDialogProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [thumbnail, setThumbnail] = useState(category?.thumbnail ?? "");
  const [color, setColor] = useState(category?.color ?? "");
  const [order, setOrder] = useState(String(category?.order ?? 0));
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    thumbnail?: string;
    color?: string;
    order?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateReadingCategoryForm({
      name,
      description,
      thumbnail,
      color,
      order,
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
            {mode === "create" ? "Thêm danh mục Reading" : "Sửa danh mục"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo danh mục mới để nhóm các bài đọc theo chủ đề."
              : "Cập nhật thông tin danh mục."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tên danh mục <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: IELTS Academic, Business English..."
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name}</p>
            ) : null}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Mô tả
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về danh mục này..."
              rows={3}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : null}
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Thumbnail URL
            </label>
            <Input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
              aria-invalid={Boolean(errors.thumbnail)}
            />
            {errors.thumbnail ? (
              <p className="text-xs text-destructive">{errors.thumbnail}</p>
            ) : null}
            {thumbnail.trim() ? (
              <img
                src={thumbnail}
                alt={name || "Category thumbnail"}
                className="mt-2 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            ) : null}
          </div>

          {/* Color + Order */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Màu sắc (hex)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="text-sm"
                  aria-invalid={Boolean(errors.color)}
                />
                {color && (
                  <div
                    className="h-8 w-8 shrink-0 rounded-lg border border-border"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
              {errors.color ? (
                <p className="text-xs text-destructive">{errors.color}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Thứ tự hiển thị
              </label>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                className="text-sm"
                aria-invalid={Boolean(errors.order)}
              />
              {errors.order ? (
                <p className="text-xs text-destructive">{errors.order}</p>
              ) : null}
            </div>
          </div>

          {/* Actions */}
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
                  ? "Thêm danh mục"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
