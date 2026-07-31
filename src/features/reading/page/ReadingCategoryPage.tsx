import { useState } from "react";
import { Plus, Search, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import ReadingCategoryCard from "../components/ReadingCategoryCard";
import ReadingCategoryFormDialog from "../components/ReadingCategoryFormDialog";
import { useReadingCategoryController } from "../hooks/useReadingCategoryController";
import type { ReadingCategory } from "@/api/readingCategoryApi";

function CategorySkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton key={idx} className="h-56 w-full rounded-3xl" />
      ))}
    </div>
  );
}

export default function ReadingCategoryPage() {
  const controller = useReadingCategoryController();
  const [categoryToDelete, setCategoryToDelete] = useState<ReadingCategory | null>(
    null,
  );

  const isEditorOpen = controller.categoryEditor !== null;

  return (
    <div className="space-y-5">
      {/* Section Header & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Reading Categories
          </h2>
          <p className="text-sm text-muted-foreground">
            {controller.categories.length} danh mục phù hợp
          </p>
        </div>

        <Button type="button" onClick={controller.openCreateCategory}>
          <Plus className="size-4" />
          Create Category
        </Button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={controller.search}
          onChange={(e) => controller.handleSearchChange(e.target.value)}
          placeholder="Tìm danh mục..."
          className="pl-9"
        />
      </div>

      {/* Error State */}
      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {/* Loading State */}
      {controller.isLoading && controller.categories.length === 0 ? (
        <CategorySkeletonGrid />
      ) : null}

      {/* Empty State */}
      {!controller.isLoading &&
      !controller.error &&
      controller.categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <BookOpen className="mx-auto size-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
            {controller.search
              ? "Không tìm thấy danh mục phù hợp."
              : "Chưa có danh mục nào"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu bằng việc tạo danh mục bài đọc đầu tiên.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={controller.openCreateCategory}
          >
            <Plus className="mr-1.5 size-4" />
            Create Category
          </Button>
        </div>
      ) : null}

      {/* Grid of Category Cards */}
      {controller.categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {controller.categories.map((cat) => (
            <ReadingCategoryCard
              key={cat._id}
              category={cat}
              onEdit={controller.openEditCategory}
              onDelete={setCategoryToDelete}
              onToggleStatus={controller.toggleStatus}
            />
          ))}
        </div>
      ) : null}

      {/* Form Dialog */}
      {isEditorOpen ? (
        <ReadingCategoryFormDialog
          open={isEditorOpen}
          mode={controller.categoryEditor?.mode ?? "create"}
          category={
            controller.categoryEditor?.mode === "edit"
              ? controller.categoryEditor.category
              : null
          }
          isSubmitting={controller.isSubmitting}
          onOpenChange={(open) => {
            if (!open) controller.closeCategoryEditor();
          }}
          onSubmit={controller.saveCategory}
        />
      ) : null}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(categoryToDelete)}
        title="Xóa danh mục?"
        description={
          categoryToDelete ? (
            <>
              Danh mục <strong>{categoryToDelete.name}</strong> sẽ bị xóa. Chỉ có
              thể xóa danh mục khi không còn bài đọc nào bên trong.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        onConfirm={async () => {
          if (!categoryToDelete) return;
          await controller.deleteCategory(categoryToDelete);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
