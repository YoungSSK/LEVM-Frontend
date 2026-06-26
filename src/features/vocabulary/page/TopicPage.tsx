import { useState } from "react";
import { Plus, Search } from "lucide-react";

import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import PaginationBar from "@/features/vocabulary/components/PaginationBar";
import TopicCard from "@/features/vocabulary/components/TopicCard";
import TopicFormSheet from "@/features/vocabulary/components/TopicFormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopicsController } from "@/features/vocabulary/hooks/useTopicsController";
import type { VocabularyTopic } from "@/features/vocabulary/types";

function TopicSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-52 w-full rounded-3xl" />
      ))}
    </div>
  );
}

export default function TopicPage() {
  const controller = useTopicsController();
  const [topicToDelete, setTopicToDelete] = useState<VocabularyTopic | null>(
    null,
  );
  const isEditorOpen = controller.topicEditor !== null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Topics
          </h2>
          <p className="text-sm text-muted-foreground">
            {controller.totalTopics} topic phù hợp
          </p>
        </div>

        <Button type="button" onClick={controller.openCreateTopic}>
          <Plus className="size-4" />
          Create Topic
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={controller.search}
          onChange={(event) => controller.setSearch(event.target.value)}
          placeholder="Tìm topic..."
          className="pl-9"
        />
      </div>

      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {controller.isLoading && controller.topics.length === 0 ? (
        <TopicSkeletonGrid />
      ) : null}

      {!controller.isLoading &&
      !controller.error &&
      controller.topics.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <p className="font-medium text-foreground">
            {controller.search
              ? "Không tìm thấy topic phù hợp."
              : "Chưa có topic nào"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo topic đầu tiên để bắt đầu quản lý vocabulary.
          </p>
        </div>
      ) : null}

      {controller.topics.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {controller.topics.map((topic) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              onEdit={controller.openEditTopic}
              onDelete={setTopicToDelete}
            />
          ))}
        </div>
      ) : null}

      <PaginationBar
        page={controller.page}
        totalPages={controller.totalPages}
        totalItems={controller.totalTopics}
        pageSize={controller.pageSize}
        onPageChange={controller.setPage}
      />

      {isEditorOpen ? (
        <TopicFormSheet
          key={
            controller.topicEditor?.mode === "edit"
              ? `edit-${controller.topicEditor.topic._id}`
              : "create-topic"
          }
          open={isEditorOpen}
          mode={controller.topicEditor?.mode ?? "create"}
          topic={
            controller.topicEditor?.mode === "edit"
              ? controller.topicEditor.topic
              : null
          }
          isSubmitting={controller.isSaving}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeTopicEditor();
            }
          }}
          onSubmit={controller.saveTopic}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(topicToDelete)}
        title="Xóa topic?"
        description={
          topicToDelete ? (
            <>
              Topic <strong>{topicToDelete.name}</strong> sẽ bị xóa vĩnh viễn.
              Các lesson bên trong vẫn cần được xử lý riêng nếu backend không tự
              cascade.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setTopicToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (!topicToDelete) return;
          await controller.deleteTopic(topicToDelete);
          setTopicToDelete(null);
        }}
      />
    </div>
  );
}
