import { useState } from "react";
import type { FormEvent } from "react";

import type { OccupationCategory } from "@/api/occupationCategoryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface OccupationOccupationSheetProps {
  open: boolean;
  mode: "create" | "edit";
  categories: OccupationCategory[];
  initialCategoryId: string;
  initialName?: string;
  initialDescription?: string;
  initialIsActive?: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    categoryId: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) => Promise<void>;
}

export default function OccupationOccupationSheet({
  open,
  mode,
  categories,
  initialCategoryId,
  initialName = "",
  initialDescription = "",
  initialIsActive = true,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: OccupationOccupationSheetProps) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!categoryId) {
      setError("Hãy chọn một nhóm ngành nghề cho ngành nghề này.");
      return;
    }

    if (!trimmedName) {
      setError("Tên ngành nghề không được để trống.");
      return;
    }

    setError(null);
    await onSubmit({
      categoryId,
      name: trimmedName,
      description: trimmedDescription || undefined,
      isActive,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {mode === "create" ? "Thêm ngành nghề" : "Sửa ngành nghề"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Tạo mới một ngành nghề thuộc nhóm đã chọn."
                : "Cập nhật thông tin ngành nghề đang chọn."}
            </SheetDescription>
          </SheetHeader>

          <form className="flex h-full flex-col gap-5 px-6 pb-6 pt-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nhóm ngành
              </label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={cn(
                  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              >
                <option value="">Chọn nhóm ngành</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tên ngành nghề
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Lập trình viên"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả ngành nghề"
                className={cn(
                  "min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Hiển thị trạng thái đang hoạt động</span>
            </label>

            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

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
                    ? "Thêm ngành nghề"
                    : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
