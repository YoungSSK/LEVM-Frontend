import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import LessonCard from "@/features/vocabulary/components/LessonCard";
import LessonFormSheet from "@/features/vocabulary/components/LessonFormSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopicDetailController } from "@/features/vocabulary/hooks/useTopicDetailController";
import type { VocabularyLesson } from "@/features/vocabulary/types";
import { vocabularyRoutePaths } from "@/features/vocabulary/routes/vocabularyRoutes";

function LessonSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-60 w-full rounded-3xl" />
      ))}
    </div>
  );
}

export default function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const controller = useTopicDetailController(topicId);
  const [lessonToDelete, setLessonToDelete] = useState<VocabularyLesson | null>(
    null,
  );
  const isEditorOpen = controller.lessonEditor !== null;

  return (
    <div className="space-y-5">
      <Link
        to={vocabularyRoutePaths.topics}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại Topics
      </Link>

      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {controller.isLoadingTopic && !controller.topic ? (
        <Skeleton className="h-32 w-full rounded-3xl" />
      ) : null}

      {controller.topic ? (
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-3 px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Topic Information
                </p>
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  {controller.topic.name}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {controller.topic.description || "Không có mô tả."}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Lesson Count
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {controller.topic.lessonCount}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Slug
                </p>
                <p className="mt-1 truncate font-medium text-foreground">
                  {controller.topic.slug}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Order
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {controller.topic.order}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {controller.topic.isActive ? "Đang hoạt động" : "Tạm ẩn"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Lessons
        </h2>

        <Button
          type="button"
          onClick={controller.openCreateLesson}
          disabled={!controller.topic}
        >
          <Plus className="size-4" />
          Create Lesson
        </Button>
      </div>

      {controller.isLoadingLessons && controller.lessons.length === 0 ? (
        <LessonSkeletonGrid />
      ) : null}

      {!controller.isLoadingLessons &&
      !controller.error &&
      controller.lessons.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <p className="font-medium text-foreground">Chưa có lesson nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo lesson đầu tiên cho topic này.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={controller.openCreateLesson}
          >
            <Plus className="size-4" />
            Create Lesson
          </Button>
        </div>
      ) : null}

      {controller.lessons.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {controller.lessons.map((lesson) => (
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              onEdit={controller.openEditLesson}
              onDelete={setLessonToDelete}
            />
          ))}
        </div>
      ) : null}

      {isEditorOpen && controller.topic ? (
        <LessonFormSheet
          key={
            controller.lessonEditor?.mode === "edit"
              ? `edit-${controller.lessonEditor.lesson._id}`
              : "create-lesson"
          }
          open={isEditorOpen}
          mode={controller.lessonEditor?.mode ?? "create"}
          topicId={controller.topic._id}
          topicName={controller.topic.name}
          lesson={
            controller.lessonEditor?.mode === "edit"
              ? controller.lessonEditor.lesson
              : null
          }
          isSubmitting={controller.isSavingLesson}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeLessonEditor();
            }
          }}
          onSubmit={controller.saveLesson}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(lessonToDelete)}
        title="Xóa lesson?"
        description={
          lessonToDelete ? (
            <>
              Lesson <strong>{lessonToDelete.title}</strong> sẽ bị xóa vĩnh
              viễn.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setLessonToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (!lessonToDelete) return;
          await controller.deleteLesson(lessonToDelete);
          setLessonToDelete(null);
        }}
      />
    </div>
  );
}
