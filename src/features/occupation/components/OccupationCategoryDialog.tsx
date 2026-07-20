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
import { cn } from "@/lib/utils";

interface OccupationCategoryDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { name: string; description?: string }) => Promise<void>;
}

export default function OccupationCategoryDialog({
  open,
  mode,
  initialName = "",
  initialDescription = "",
  isSubmitting,
  onOpenChange,
  onSubmit,
}: OccupationCategoryDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm nhóm ngành" : "Sửa nhóm ngành"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo một nhóm ngành mới để gom nhiều occupation cùng phân loại."
              : "Cập nhật tên và mô tả của nhóm ngành đang chọn."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
                  ? "Thêm nhóm"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
