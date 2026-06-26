import { useEffect, useState } from "react";
/* eslint-disable react-hooks/set-state-in-effect */
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  AddWordToLessonPayload,
  VocabularyMeaning,
  VocabularyWord,
} from "@/features/vocabulary/types";
import { validateAddWordToLessonForm } from "@/features/vocabulary/schemas/vocabularySchemas";

interface AddWordToLessonModalProps {
  open: boolean;
  lessonId: string;
  lessonLabel: string;
  words: VocabularyWord[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadMeanings: (wordId: string) => Promise<VocabularyMeaning[]>;
  onSubmit: (payload: AddWordToLessonPayload) => Promise<void>;
}

export default function AddWordToLessonModal({
  open,
  lessonId,
  lessonLabel,
  words,
  isSubmitting,
  onOpenChange,
  onLoadMeanings,
  onSubmit,
}: AddWordToLessonModalProps) {
  const [query, setQuery] = useState("");
  const [selectedWordId, setSelectedWordId] = useState("");
  const [selectedMeaningId, setSelectedMeaningId] = useState("");
  const [meanings, setMeanings] = useState<VocabularyMeaning[]>([]);
  const [isLoadingMeanings, setIsLoadingMeanings] = useState(false);
  const [errors, setErrors] = useState<{
    wordId?: string;
    meaningId?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedWordId("");
      setSelectedMeaningId("");
      setMeanings([]);
      setIsLoadingMeanings(false);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!selectedWordId) {
      setMeanings([]);
      setSelectedMeaningId("");
      return;
    }

    let isActive = true;

    setIsLoadingMeanings(true);
    setSelectedMeaningId("");

    void onLoadMeanings(selectedWordId)
      .then((nextMeanings) => {
        if (!isActive) return;
        setMeanings(nextMeanings);
      })
      .catch((loadError) => {
        if (!isActive) return;
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải meanings.";
        setErrors((current) => ({
          ...current,
          form: message,
        }));
        setMeanings([]);
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingMeanings(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedWordId, onLoadMeanings]);

  useEffect(() => {
    if (selectedWordId && !words.some((word) => word._id === selectedWordId)) {
      setSelectedWordId("");
    }
  }, [selectedWordId, words]);

  const filteredWords = words.filter((word) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return true;

    return (
      word.word.toLowerCase().includes(normalizedQuery) ||
      (word.phonetic || "").toLowerCase().includes(normalizedQuery) ||
      (word.meaningPreview || "").toLowerCase().includes(normalizedQuery)
    );
  });

  const handleWordKeyDown = (wordId: string, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedWordId(wordId);
    }
  };

  const handleSubmit = async () => {
    const result = validateAddWordToLessonForm({
      lessonId,
      wordId: selectedWordId,
      meaningId: selectedMeaningId,
    });

    if (!result.values) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.values);
  };

  const selectedWord = words.find((word) => word._id === selectedWordId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="pr-10">
          <DialogTitle>Add Word To Lesson</DialogTitle>
          <DialogDescription>
            Chọn một word, sau đó chọn đúng meaning cho lesson "{lessonLabel}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedWord ? (
            <>
              <div className="relative">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search word..."
                />
              </div>

              {errors.wordId ? (
                <p className="text-sm text-destructive">{errors.wordId}</p>
              ) : null}

              <div className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
                {filteredWords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
                    <p className="font-medium text-foreground">
                      Không tìm thấy word phù hợp.
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Hãy thử từ khóa khác.
                    </p>
                  </div>
                ) : (
                  filteredWords.map((word) => (
                    <button
                      key={word._id}
                      type="button"
                      onClick={() => setSelectedWordId(word._id)}
                      onKeyDown={(event) => handleWordKeyDown(word._id, event)}
                      className="flex w-full items-start justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{word.word}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {word.phonetic || "Chưa có phonetic"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {word.meaningPreview || "Chưa có meaning preview."}
                        </p>
                      </div>
                      <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                        {word.meaningCount ?? word.meanings?.length ?? 0} meanings
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 rounded-3xl border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Selected word
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    {selectedWord.word}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedWord.phonetic || "Chưa có phonetic"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWordId("")}
                >
                  Đổi word
                </Button>
              </div>

              {errors.form ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {errors.form}
                </p>
              ) : null}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Chọn meaning
                  </p>
                  {errors.meaningId ? (
                    <span className="text-xs text-destructive">{errors.meaningId}</span>
                  ) : null}
                </div>

                {isLoadingMeanings ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 animate-pulse rounded-2xl bg-muted"
                      />
                    ))}
                  </div>
                ) : meanings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
                    <p className="font-medium text-foreground">
                      Word này chưa có meaning nào.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {meanings.map((meaning) => (
                      <label
                        key={meaning._id}
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/60"
                      >
                        <input
                          type="radio"
                          name="meaningId"
                          value={meaning._id}
                          checked={selectedMeaningId === meaning._id}
                          onChange={() => setSelectedMeaningId(meaning._id)}
                          className="mt-1 size-4"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {meaning.partOfSpeech}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {meaning.meaning}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {meaning.example || "Không có ví dụ."}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !selectedWord}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isSubmitting ? "Đang lưu..." : "Add Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

