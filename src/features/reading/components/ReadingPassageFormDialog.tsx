import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReadingCategory } from "@/api/readingCategoryApi";
import type { ReadingPassage } from "@/api/readingPassageApi";
import PackageAccessSelector from "@/components/PackageAccessSelector";
import {
  validateReadingPassageForm,
  type PassageDifficulty,
  type PassageCefrLevel,
  type PassageReadingType,
} from "@/features/reading/schemas/readingSchemas";

interface ReadingPassageFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  categories: ReadingCategory[];
  defaultCategoryId?: string;
  passage: ReadingPassage | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    categoryId: string;
    title: string;
    description?: string;
    thumbnail?: string;
    difficulty: PassageDifficulty;
    cefrLevel: PassageCefrLevel;
    readingType: PassageReadingType;
    tags: string[];
    estimatedTime?: number;
    xpReward: number;
    passThreshold: number;
    htmlContent?: string;
    allowedPackageIds?: string[];
  }) => Promise<void>;
}

export default function ReadingPassageFormDialog({
  open,
  mode,
  categories,
  defaultCategoryId,
  passage,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ReadingPassageFormDialogProps) {
  const initialCatId =
    passage
      ? typeof passage.categoryId === "object"
        ? passage.categoryId._id
        : passage.categoryId
      : defaultCategoryId || categories[0]?._id || "";

  const [categoryId, setCategoryId] = useState(initialCatId);
  const [title, setTitle] = useState(passage?.title ?? "");
  const [description, setDescription] = useState(passage?.description ?? "");
  const [thumbnail, setThumbnail] = useState(passage?.thumbnail ?? "");
  const [difficulty, setDifficulty] = useState<PassageDifficulty>(
    passage?.difficulty ?? "intermediate",
  );
  const [cefrLevel, setCefrLevel] = useState<PassageCefrLevel>(
    passage?.cefrLevel ?? "B1",
  );
  const [readingType, setReadingType] = useState<PassageReadingType>(
    passage?.readingType ?? "article",
  );
  const [tags, setTags] = useState(passage?.tags?.join(", ") ?? "");
  const [estimatedTime, setEstimatedTime] = useState(
    String(passage?.estimatedTime ?? 0),
  );
  const [xpReward, setXpReward] = useState(String(passage?.xpReward ?? 15));
  const [passThreshold, setPassThreshold] = useState(
    String(passage?.passThreshold ?? 70),
  );
  const [allowedPackageIds, setAllowedPackageIds] = useState<string[]>(
    (passage?.allowedPackageIds as any[])?.map((p) => (typeof p === "object" ? p._id : p)) ?? [],
  );
  const [htmlContent] = useState("<p>Nhập nội dung bài đọc ở đây...</p>");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateReadingPassageForm({
      categoryId,
      title,
      description,
      thumbnail,
      difficulty,
      cefrLevel,
      readingType,
      tags,
      estimatedTime,
      xpReward,
      passThreshold,
    });

    if (!result.values) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit({
      ...result.values,
      htmlContent: mode === "create" ? htmlContent : undefined,
      allowedPackageIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tạo bài đọc mới" : "Chỉnh sửa bài đọc"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo bài đọc mới. Nội dung văn bản có thể chỉnh sửa bằng editor hoặc upload từ file DOCX sau."
              : "Cập nhật metadata của bài đọc."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Danh mục <span className="text-destructive">*</span>
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId ? (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            ) : null}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Tiêu đề bài đọc <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Climate Change and Global Trade Patterns"
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : null}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Mô tả ngắn</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả tóm tắt nội dung bài đọc..."
              rows={2}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : null}
          </div>

          {/* Classification grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Độ khó</label>
              <Select
                value={difficulty}
                onValueChange={(val) => setDifficulty(val as PassageDifficulty)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="upper_intermediate">Upper Int.</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">CEFR Level</label>
              <Select
                value={cefrLevel}
                onValueChange={(val) => setCefrLevel(val as PassageCefrLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Dạng văn bản</label>
              <Select
                value={readingType}
                onValueChange={(val) => setReadingType(val as PassageReadingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="narrative">Narrative</SelectItem>
                  <SelectItem value="descriptive">Descriptive</SelectItem>
                  <SelectItem value="expository">Expository</SelectItem>
                  <SelectItem value="argumentative">Argumentative</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="notice">Notice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Tags (cách nhau bởi dấu phẩy)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ielts, environment, science"
              />
              {errors.tags ? (
                <p className="text-xs text-destructive">{errors.tags}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Thời gian ước tính (phút)
              </label>
              <Input
                type="number"
                min={0}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
              {errors.estimatedTime ? (
                <p className="text-xs text-destructive">{errors.estimatedTime}</p>
              ) : null}
            </div>
          </div>

          {/* Gamification Settings */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/30 p-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">XP Thưởng</label>
              <Input
                type="number"
                min={0}
                max={1000}
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
              />
              {errors.xpReward ? (
                <p className="text-xs text-destructive">{errors.xpReward}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Ngưỡng Đạt (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passThreshold}
                onChange={(e) => setPassThreshold(e.target.value)}
              />
              {errors.passThreshold ? (
                <p className="text-xs text-destructive">{errors.passThreshold}</p>
              ) : null}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Thumbnail URL</label>
            <Input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
            />
            {errors.thumbnail ? (
              <p className="text-xs text-destructive">{errors.thumbnail}</p>
            ) : null}
          </div>

          {/* Package Access Selector */}
          <PackageAccessSelector
            value={allowedPackageIds}
            onChange={setAllowedPackageIds}
            disabled={isSubmitting}
          />

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
                  ? "Tạo bài đọc"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
