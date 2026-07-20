import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { VocabularyMeaning } from "@/features/vocabulary/types";
import {
  validateMeaningForm,
  validateMeaningUpdateForm,
} from "@/features/vocabulary/schemas/vocabularySchemas";

interface MeaningFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  wordLabel: string;
  meaning: VocabularyMeaning | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    partOfSpeech: string;
    meaning: string;
    example?: string;
  }) => Promise<void>;
}

export default function MeaningFormDialog({
  open,
  mode,
  wordLabel,
  meaning,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: MeaningFormDialogProps) {
  const [partOfSpeech, setPartOfSpeech] = useState(meaning?.partOfSpeech ?? "");
  const [meaningValue, setMeaningValue] = useState(meaning?.meaning ?? "");
  const [example, setExample] = useState(meaning?.exampleSentence ?? "");
  const [errors, setErrors] = useState<{
    partOfSpeech?: string;
    meaning?: string;
    example?: string;
  }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result =
      mode === "create"
        ? validateMeaningForm({
            partOfSpeech,
            meaning: meaningValue,
            example,
          })
        : validateMeaningUpdateForm({
            partOfSpeech,
            meaning: meaningValue,
            example,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm meaning" : "Sửa meaning"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Thêm nghĩa mới cho word "${wordLabel}".`
              : `Cập nhật meaning của word "${wordLabel}".`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Part of speech
            </label>
            <Select
              value={partOfSpeech}
              onValueChange={(value) => setPartOfSpeech(value)}
            >
              <SelectTrigger aria-invalid={Boolean(errors.partOfSpeech)}>
                <SelectValue placeholder="Chọn loại từ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="noun">Noun (Danh từ)</SelectItem>
                <SelectItem value="verb">Verb (Động từ)</SelectItem>
                <SelectItem value="adjective">Adjective (Tính từ)</SelectItem>
                <SelectItem value="adverb">Adverb (Trạng từ)</SelectItem>
                <SelectItem value="pronoun">Pronoun (Đại từ)</SelectItem>
                <SelectItem value="preposition">Preposition (Giới từ)</SelectItem>
                <SelectItem value="conjunction">Conjunction (Liên từ)</SelectItem>
                <SelectItem value="interjection">Interjection (Cảm từ)</SelectItem>
                <SelectItem value="determiner">Determiner (Mạo từ)</SelectItem>
              </SelectContent>
            </Select>
            {errors.partOfSpeech ? (
              <p className="text-xs text-destructive">{errors.partOfSpeech}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meaning</label>
            <Textarea
              value={meaningValue}
              onChange={(event) => setMeaningValue(event.target.value)}
              placeholder="Nghĩa tiếng Việt"
              aria-invalid={Boolean(errors.meaning)}
            />
            {errors.meaning ? (
              <p className="text-xs text-destructive">{errors.meaning}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Example</label>
            <Textarea
              value={example}
              onChange={(event) => setExample(event.target.value)}
              placeholder="Ví dụ sử dụng"
              aria-invalid={Boolean(errors.example)}
            />
            {errors.example ? (
              <p className="text-xs text-destructive">{errors.example}</p>
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
                  ? "Thêm meaning"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
