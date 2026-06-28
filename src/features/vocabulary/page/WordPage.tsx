import { useState } from "react";
import { Plus, Search } from "lucide-react";

import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import PaginationBar from "@/features/vocabulary/components/PaginationBar";
import WordCard from "@/features/vocabulary/components/WordCard";
import WordFormSheet from "@/features/vocabulary/components/WordFormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useWordsController } from "@/features/vocabulary/hooks/useWordsController";
import type { VocabularyWord } from "@/features/vocabulary/types";

function WordSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className="h-52 w-full rounded-3xl" />
      ))}
    </div>
  );
}

export default function WordPage() {
  const controller = useWordsController();
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null);
  const isEditorOpen = controller.wordEditor !== null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Words
          </h2>
          <p className="text-sm text-muted-foreground">
            {controller.totalWords} word phù hợp
          </p>
        </div>

        <Button type="button" onClick={controller.openCreateWord}>
          <Plus className="size-4" />
          Create Word
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={controller.search}
          onChange={(event) => controller.setSearch(event.target.value)}
          placeholder="Tìm word, phonetic..."
          className="pl-9"
        />
      </div>

      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {controller.isLoading && controller.words.length === 0 ? (
        <WordSkeletonGrid />
      ) : null}

      {!controller.isLoading &&
      !controller.error &&
      controller.words.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <p className="font-medium text-foreground">
            {controller.search
              ? "Không tìm thấy word phù hợp."
              : "Chưa có word nào"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo word đầu tiên trong hệ thống.
          </p>
        </div>
      ) : null}

      {controller.words.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {controller.words.map((word) => (
            <WordCard
              key={word._id}
              word={word}
              onEdit={controller.openEditWord}
              onDelete={setWordToDelete}
            />
          ))}
        </div>
      ) : null}

      <PaginationBar
        page={controller.page}
        totalPages={controller.totalPages}
        totalItems={controller.totalWords}
        pageSize={controller.pageSize}
        onPageChange={controller.setPage}
      />

      {isEditorOpen ? (
        <WordFormSheet
          key={
            controller.wordEditor?.mode === "edit"
              ? `edit-${controller.wordEditor.word._id}`
              : "create-word"
          }
          open={isEditorOpen}
          mode={controller.wordEditor?.mode ?? "create"}
          word={
            controller.wordEditor?.mode === "edit"
              ? controller.wordEditor.word
              : null
          }
          isSubmitting={controller.isSaving}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeWordEditor();
            }
          }}
          onSubmit={controller.saveWord}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(wordToDelete)}
        title="Xóa word?"
        description={
          wordToDelete ? (
            <>
              Word <strong>{wordToDelete.word}</strong> sẽ bị xóa vĩnh viễn.
              Các meaning và relation liên quan cần được xử lý ở backend.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setWordToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (!wordToDelete) return;
          await controller.deleteWord(wordToDelete);
          setWordToDelete(null);
        }}
      />
    </div>
  );
}
