import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateVocabularyWordPayload,
  UpdateVocabularyWordPayload,
  VocabularyWord,
} from "@/features/vocabulary/types";
import { type WordMeaningDraftValues } from "@/features/vocabulary/schemas/vocabularySchemas";

interface WordFormSheetProps {
  open: boolean;
  mode: "create" | "edit";
  word: VocabularyWord | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  // onGenerateAudio đã xóa
  onSubmit: (
    payload: CreateVocabularyWordPayload | UpdateVocabularyWordPayload,
  ) => Promise<void>;
}

type WordFormErrors = {
  word?: string;
  phonetic?: string;
  audioUrl?: string;
  meanings?: string;
  meaningErrors?: Array<{
    partOfSpeech?: string;
    meaning?: string;
    example?: string;
  }>;
};

function createBlankMeaning(): WordMeaningDraftValues {
  return {
    partOfSpeech: "",
    meaning: "",
    example: "",
  };
}

export default function WordFormSheet({
  open,
  mode,
  word,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: WordFormSheetProps) {
  const [wordValue, setWordValue] = useState(word?.word ?? "");
  const [pronunciationUs, setPronunciationUs] = useState(
    word?.pronunciations?.us ?? "",
  );
  const [pronunciationUk, setPronunciationUk] = useState(
    word?.pronunciations?.uk ?? "",
  );
  const [audioUrlUs, setAudioUrlUs] = useState(word?.audioUrls?.us ?? "");
  const [audioUrlUk, setAudioUrlUk] = useState(word?.audioUrls?.uk ?? "");
  const [meanings, setMeanings] = useState<WordMeaningDraftValues[]>(
    mode === "create" ? [createBlankMeaning()] : [],
  );
  const [errors, setErrors] = useState<WordFormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const basePayload = {
      word: wordValue.trim(),
      pronunciations: {
        us: pronunciationUs.trim(),
        uk: pronunciationUk.trim(),
      },
      audioUrls: {
        us: audioUrlUs.trim(),
        uk: audioUrlUk.trim(),
      },
    };

    if (mode === "create") {
      await onSubmit({
        ...basePayload,
        meanings: meanings.map((m) => ({
          partOfSpeech: m.partOfSpeech,
          meaning: m.meaning,
          exampleSentence: m.example,
        })),
      });
      return;
    }

    await onSubmit(basePayload);
  };

  const updateMeaning = (
    index: number,
    field: keyof WordMeaningDraftValues,
    value: string,
  ) => {
    setMeanings((current) =>
      current.map((meaning, meaningIndex) =>
        meaningIndex === index ? { ...meaning, [field]: value } : meaning,
      ),
    );
  };

  const addMeaning = () => {
    setMeanings((current) => [...current, createBlankMeaning()]);
  };

  const removeMeaning = (index: number) => {
    setMeanings((current) =>
      current.length === 1
        ? [createBlankMeaning()]
        : current.filter((_, meaningIndex) => meaningIndex !== index),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {mode === "create" ? "Thêm word" : "Sửa word"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Tạo word mới và thêm nhiều meaning trong cùng một form."
                : "Cập nhật word, phonetic và audio."}
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex h-full flex-col gap-5 px-6 pb-6 pt-4"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Word
                </label>
                <Input
                  value={wordValue}
                  onChange={(event) => setWordValue(event.target.value)}
                  placeholder="run"
                  aria-invalid={Boolean(errors.word)}
                />
                {errors.word ? (
                  <p className="text-xs text-destructive">{errors.word}</p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Pronunciation (US)
                </label>
                <Input
                  value={pronunciationUs}
                  onChange={(e) => setPronunciationUs(e.target.value)}
                  placeholder="/rʌn/"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Pronunciation (UK)
                </label>
                <Input
                  value={pronunciationUk}
                  onChange={(e) => setPronunciationUk(e.target.value)}
                  placeholder="/rʌn/"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Audio URL (US)
                </label>
                <Input
                  value={audioUrlUs}
                  onChange={(e) => setAudioUrlUs(e.target.value)}
                  placeholder="https://..."
                />
                {audioUrlUs.trim() ? (
                  <audio controls src={audioUrlUs} className="w-full" />
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Audio URL (UK)
                </label>
                <Input
                  value={audioUrlUk}
                  onChange={(e) => setAudioUrlUk(e.target.value)}
                  placeholder="https://..."
                />
                {audioUrlUk.trim() ? (
                  <audio controls src={audioUrlUk} className="w-full" />
                ) : null}
              </div>
            </div>

            {mode === "create" ? (
              <div className="space-y-4 rounded-3xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Meanings
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Thêm nhiều meaning cho word này.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMeaning}
                  >
                    <Plus className="size-4" />
                    Add Meaning
                  </Button>
                </div>

                {errors.meanings ? (
                  <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {errors.meanings}
                  </p>
                ) : null}

                <div className="space-y-4">
                  {meanings.map((meaning, index) => {
                    const itemErrors = errors.meaningErrors?.[index] ?? {};

                    return (
                      <div
                        key={index}
                        className="space-y-4 rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            Meaning {index + 1}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeMeaning(index)}
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Part Of Speech
                            </label>
                            <Input
                              value={meaning.partOfSpeech}
                              onChange={(event) =>
                                updateMeaning(
                                  index,
                                  "partOfSpeech",
                                  event.target.value,
                                )
                              }
                              placeholder="Verb"
                              aria-invalid={Boolean(itemErrors.partOfSpeech)}
                            />
                            {itemErrors.partOfSpeech ? (
                              <p className="text-xs text-destructive">
                                {itemErrors.partOfSpeech}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Meaning
                            </label>
                            <Textarea
                              value={meaning.meaning}
                              onChange={(event) =>
                                updateMeaning(
                                  index,
                                  "meaning",
                                  event.target.value,
                                )
                              }
                              placeholder="chạy"
                              aria-invalid={Boolean(itemErrors.meaning)}
                            />
                            {itemErrors.meaning ? (
                              <p className="text-xs text-destructive">
                                {itemErrors.meaning}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Example
                          </label>
                          <Textarea
                            value={meaning.example}
                            onChange={(event) =>
                              updateMeaning(
                                index,
                                "example",
                                event.target.value,
                              )
                            }
                            placeholder="I run every day."
                            aria-invalid={Boolean(itemErrors.example)}
                          />
                          {itemErrors.example ? (
                            <p className="text-xs text-destructive">
                              {itemErrors.example}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                    ? "Thêm word"
                    : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
