import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AddWordToLessonModal from "@/features/vocabulary/components/AddWordToLessonModal";
import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLessonDetailController } from "@/features/vocabulary/hooks/useLessonDetailController";
import type { VocabularyLessonWordRelation } from "@/features/vocabulary/types";
import { vocabularyRoutePaths } from "@/features/vocabulary/routes/vocabularyRoutes";

function LessonInfoSkeleton() {
  return <Skeleton className="h-40 w-full rounded-3xl" />;
}

function LessonWordTableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const controller = useLessonDetailController(lessonId);
  const [relationToDelete, setRelationToDelete] =
    useState<VocabularyLessonWordRelation | null>(null);

  return (
    <div className="space-y-5">
      <Link
        to={
          controller.topic
            ? vocabularyRoutePaths.topicDetail(controller.topic._id)
            : vocabularyRoutePaths.topics
        }
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại Topic
      </Link>

      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {controller.isLoadingLesson && !controller.lesson ? (
        <LessonInfoSkeleton />
      ) : null}

      {controller.lesson ? (
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Lesson Information
                </p>
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  {controller.lesson.title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {controller.lesson.description || "Không có mô tả."}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Word Count
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {controller.lesson.wordCount}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="rounded-2xl border border-border bg-background p-3">
                {controller.lesson.thumbnail ? (
                  <img
                    src={controller.lesson.thumbnail}
                    alt={controller.lesson.title}
                    className="aspect-[16/9] w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                    Chưa có thumbnail
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Topic
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {controller.topic?.name ?? "Unknown topic"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Order
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {controller.lesson.order}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {controller.lesson.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Words in Lesson
        </h2>
        <Button
          type="button"
          onClick={controller.openAddWordModal}
          disabled={!controller.lesson}
        >
          <Plus className="size-4" />
          Add Word To Lesson
        </Button>
      </div>

      {controller.isLoadingLessonWords && controller.lessonWords.length === 0 ? (
        <LessonWordTableSkeleton />
      ) : null}

      {!controller.isLoadingLessonWords &&
      !controller.error &&
      controller.lessonWords.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <p className="font-medium text-foreground">Chưa có word nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy thêm word đầu tiên cho lesson này.
          </p>
        </div>
      ) : null}

      {controller.lessonWords.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Word
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Meaning
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    POS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {controller.lessonWords.map((relation) => (
                  <tr key={`${relation.lessonId}-${relation.wordId}-${relation.meaningId}`}>
                    <td className="px-4 py-4 text-sm font-medium text-foreground">
                      <Link
                        to={vocabularyRoutePaths.wordDetail(relation.wordId)}
                        className="hover:text-primary"
                      >
                        {relation.word?.word ?? "Unknown word"}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {relation.meaning?.meaning ?? "Unknown meaning"}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {relation.meaning?.partOfSpeech ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setRelationToDelete(relation)}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <AddWordToLessonModal
        open={controller.isAddWordModalOpen}
        lessonId={controller.lesson?._id ?? ""}
        lessonLabel={controller.lesson?.title ?? ""}
        words={controller.availableWords}
        isSubmitting={controller.isSavingRelation}
        onOpenChange={(open) => {
          if (!open) {
            controller.closeAddWordModal();
          }
        }}
        onLoadMeanings={controller.loadWordMeanings}
        onSubmit={controller.addWordToLesson}
      />

      <ConfirmDeleteDialog
        open={Boolean(relationToDelete)}
        title="Xóa word khỏi lesson?"
        description={
          relationToDelete ? (
            <>
              Relation với word <strong>{relationToDelete.word?.word ?? relationToDelete.wordId}</strong>{" "}
              sẽ bị xóa khỏi lesson này.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setRelationToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (!relationToDelete) return;
          await controller.removeWordFromLesson(relationToDelete);
          setRelationToDelete(null);
        }}
      />
    </div>
  );
}
