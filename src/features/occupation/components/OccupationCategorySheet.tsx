import { useState } from "react";
import type { FormEvent } from "react";

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

interface OccupationCategorySheetProps {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { name: string; description?: string }) => Promise<void>;
}

export default function OccupationCategorySheet({
  open,
  mode,
  initialName = "",
  initialDescription = "",
  isSubmitting,
  onOpenChange,
  onSubmit,
}: OccupationCategorySheetProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Ten nhom nganh khong duoc de trong.");
      return;
    }

    setError(null);
    await onSubmit({
      name: trimmedName,
      description: trimmedDescription || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {mode === "create" ? "Thêm nhóm ngành" : "Sửa nhóm ngành"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Tạo một nhóm ngành mới để gom nhiều occupation cùng phân loại."
                : "Cập nhật tên và mô tả của nhóm ngành đang chọn."}
            </SheetDescription>
          </SheetHeader>

          <form className="flex h-full flex-col gap-5 px-6 pb-6 pt-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tên nhóm
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Công nghệ thông tin"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mo ta
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả ngắn về nhóm ngành"
                className={cn(
                  "min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            </div>

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
                    ? "Thêm nhóm"
                    : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
