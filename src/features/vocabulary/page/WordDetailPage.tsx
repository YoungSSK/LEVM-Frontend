import { useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import MeaningFormSheet from "@/features/vocabulary/components/MeaningFormSheet";
import MeaningList from "@/features/vocabulary/components/MeaningList";
import WordFormSheet from "@/features/vocabulary/components/WordFormSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWordDetailController } from "@/features/vocabulary/hooks/useWordDetailController";
import type { VocabularyMeaning } from "@/features/vocabulary/types";
import { vocabularyRoutePaths } from "@/features/vocabulary/routes/vocabularyRoutes";

export default function WordDetailPage() {
  const navigate = useNavigate();
  const { wordId } = useParams<{ wordId: string }>();
  const controller = useWordDetailController(wordId);
  const [meaningToDelete, setMeaningToDelete] =
    useState<VocabularyMeaning | null>(null);
  const [shouldDeleteWord, setShouldDeleteWord] = useState(false);
  const isMeaningEditorOpen = controller.meaningEditor !== null;
  const isWordEditorOpen = controller.wordEditor !== null;

  return (
    <div className="space-y-5">
      <Link
        to={vocabularyRoutePaths.words}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại Words
      </Link>

      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {controller.isLoadingWord && !controller.word ? (
        <Skeleton className="h-40 w-full rounded-3xl" />
      ) : null}

      {controller.word ? (
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Basic Information
                </p>
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  {controller.word.word}
                </h1>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>US: {controller.word.pronunciations?.us || "—"}</span>
                  <span>UK: {controller.word.pronunciations?.uk || "—"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={controller.openEditWord}
                >
                  <Pencil className="size-4" />
                  Edit Word
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShouldDeleteWord(true)}
                >
                  <Trash2 className="size-4" />
                  Delete Word
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Audio
                </p>
                {controller.word.audioUrls?.us ||
                controller.word.audioUrls?.uk ? (
                  <div className="mt-2 space-y-3">
                    {controller.word.audioUrls?.us ? (
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">US</p>
                        <audio
                          controls
                          src={controller.word.audioUrls.us}
                          className="w-full"
                        />
                      </div>
                    ) : null}
                    {controller.word.audioUrls?.uk ? (
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">UK</p>
                        <audio
                          controls
                          src={controller.word.audioUrls.uk}
                          className="w-full"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chưa có audio.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Meaning Count
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {controller.meanings.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Meanings
        </h2>
        <Button
          type="button"
          onClick={controller.openCreateMeaning}
          disabled={!controller.word}
        >
          <Plus className="size-4" />
          Add Meaning
        </Button>
      </div>

      {controller.isLoadingMeanings && controller.meanings.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
      ) : null}

      {controller.meanings.length > 0 ? (
        <MeaningList
          meanings={controller.meanings}
          onEdit={controller.openEditMeaning}
          onDelete={setMeaningToDelete}
        />
      ) : null}

      {!controller.isLoadingMeanings && controller.meanings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <p className="font-medium text-foreground">Chưa có meaning nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy thêm meaning đầu tiên cho word này.
          </p>
        </div>
      ) : null}

      {isWordEditorOpen && controller.word ? (
        <WordFormSheet
          key={`edit-${controller.wordEditor?.word._id ?? controller.word._id}`}
          open={isWordEditorOpen}
          mode="edit"
          word={controller.wordEditor?.word ?? controller.word}
          isSubmitting={controller.isSavingWord}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeWordEditor();
            }
          }}
          onSubmit={controller.saveWord}
        />
      ) : null}

      {isMeaningEditorOpen && controller.word ? (
        <MeaningFormSheet
          key={
            controller.meaningEditor?.mode === "edit"
              ? `edit-${controller.meaningEditor.meaning._id}`
              : "create-meaning"
          }
          open={isMeaningEditorOpen}
          mode={controller.meaningEditor?.mode ?? "create"}
          wordLabel={controller.word.word}
          meaning={
            controller.meaningEditor?.mode === "edit"
              ? controller.meaningEditor.meaning
              : null
          }
          isSubmitting={controller.isSavingMeaning}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeMeaningEditor();
            }
          }}
          onSubmit={controller.saveMeaning}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(meaningToDelete)}
        title="Xóa meaning?"
        description={
          meaningToDelete ? (
            <>
              Meaning <strong>{meaningToDelete.meaning}</strong> sẽ bị xóa vĩnh
              viễn.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setMeaningToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (!meaningToDelete) return;
          await controller.deleteMeaning(meaningToDelete);
          setMeaningToDelete(null);
        }}
      />

      <ConfirmDeleteDialog
        open={shouldDeleteWord}
        title="Xóa word?"
        description={
          controller.word ? (
            <>
              Word <strong>{controller.word.word}</strong> sẽ bị xóa vĩnh viễn.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setShouldDeleteWord(false);
          }
        }}
        onConfirm={async () => {
          const deleted = await controller.deleteWord();
          if (deleted) {
            navigate(vocabularyRoutePaths.words);
          }
          setShouldDeleteWord(false);
        }}
      />
    </div>
  );
}
