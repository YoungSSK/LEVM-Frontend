import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { VocabularyMeaning } from "@/features/vocabulary/types";
import {
  validateMeaningForm,
  validateMeaningUpdateForm,
} from "@/features/vocabulary/schemas/vocabularySchemas";

interface MeaningFormSheetProps {
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

export default function MeaningFormSheet({
  open,
  mode,
  wordLabel,
  meaning,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: MeaningFormSheetProps) {
  const [partOfSpeech, setPartOfSpeech] = useState(meaning?.partOfSpeech ?? "");
  const [meaningValue, setMeaningValue] = useState(meaning?.meaning ?? "");
  const [example, setExample] = useState(meaning?.example ?? "");
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {mode === "create" ? "Thêm meaning" : "Sửa meaning"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? `Thêm nghĩa mới cho word "${wordLabel}".`
                : `Cập nhật meaning của word "${wordLabel}".`}
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex h-full flex-col gap-5 px-6 pb-6 pt-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Part of speech
              </label>
              <Input
                value={partOfSpeech}
                onChange={(event) => setPartOfSpeech(event.target.value)}
                placeholder="Ví dụ: Verb"
                aria-invalid={Boolean(errors.partOfSpeech)}
              />
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
                    ? "Thêm meaning"
                    : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
