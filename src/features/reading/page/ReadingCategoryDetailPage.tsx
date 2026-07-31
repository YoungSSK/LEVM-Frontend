import { useState } from "react";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";
import ReadingPassageCard from "../components/ReadingPassageCard";
import ReadingPassageFormDialog from "../components/ReadingPassageFormDialog";
import { useReadingCategoryDetailController } from "../hooks/useReadingCategoryDetailController";
import type { ReadingPassage, ReadingPassageStatus } from "@/api/readingPassageApi";
import { readingRoutePaths } from "../routes/readingRoutes";

function PassageSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Skeleton key={idx} className="h-64 w-full rounded-3xl" />
      ))}
    </div>
  );
}

export default function ReadingCategoryDetailPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const controller = useReadingCategoryDetailController(categorySlug);
  const [passageToDelete, setPassageToDelete] = useState<ReadingPassage | null>(
    null,
  );

  const isEditorOpen = controller.passageEditor !== null;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to={readingRoutePaths.categories}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại Danh mục Reading
      </Link>

      {/* Error Message */}
      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {/* Category Info Header Card */}
      {controller.isLoadingCategory && !controller.category ? (
        <Skeleton className="h-36 w-full rounded-3xl" />
      ) : controller.category ? (
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-3 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Reading Category
                </p>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  {controller.category.name}
                </h1>
                {controller.category.description ? (
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {controller.category.description}
                  </p>
                ) : null}
              </div>

              <Badge
                variant={controller.category.isActive ? "default" : "outline"}
              >
                {controller.category.isActive ? "Đang hoạt động" : "Đã ẩn"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs">
              <div>
                <span className="text-muted-foreground">Tổng số bài đọc:</span>{" "}
                <span className="font-bold text-foreground">
                  {controller.category.passageCount}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">Thứ tự danh mục:</span>{" "}
                <span className="font-bold text-foreground">
                  {controller.category.order}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Passages Section Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Danh sách Bài đọc ({controller.passages.length})
        </h2>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select
              value={controller.statusFilter || "all"}
              onValueChange={(val) =>
                controller.setStatusFilter(val === "all" ? "" : (val as ReadingPassageStatus))
              }
            >
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="archived">Đã lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={controller.openCreatePassage}
            disabled={!controller.category}
          >
            <Plus className="mr-1.5 size-4" />
            Thêm bài đọc
          </Button>
        </div>
      </div>

      {/* Loading Grid */}
      {controller.isLoadingPassages && controller.passages.length === 0 ? (
        <PassageSkeletonGrid />
      ) : null}

      {/* Empty State */}
      {!controller.isLoadingPassages &&
      !controller.error &&
      controller.passages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold text-foreground">Chưa có bài đọc nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo bài đọc đầu tiên cho danh mục này.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={controller.openCreatePassage}
          >
            <Plus className="mr-1.5 size-4" />
            Thêm bài đọc
          </Button>
        </div>
      ) : null}

      {/* Grid of Passage Cards */}
      {controller.passages.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {controller.passages.map((passage) => (
            <ReadingPassageCard
              key={passage._id}
              passage={passage}
              onView={() => navigate(readingRoutePaths.passageDetail(passage.slug))}
              onEdit={controller.openEditPassage}
              onDelete={setPassageToDelete}
              onChangeStatus={controller.changeStatus}
              onClone={controller.clonePassage}
            />
          ))}
        </div>
      ) : null}

      {/* Passage Form Dialog */}
      {isEditorOpen && controller.category ? (
        <ReadingPassageFormDialog
          open={isEditorOpen}
          mode={controller.passageEditor?.mode ?? "create"}
          categories={[controller.category]}
          defaultCategoryId={controller.category._id}
          passage={
            controller.passageEditor?.mode === "edit"
              ? controller.passageEditor.passage
              : null
          }
          isSubmitting={controller.isSubmitting}
          onOpenChange={(open) => {
            if (!open) controller.closePassageEditor();
          }}
          onSubmit={controller.savePassage}
        />
      ) : null}

      {/* Delete Confirm Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(passageToDelete)}
        title="Xóa bài đọc?"
        description={
          passageToDelete ? (
            <>
              Bài đọc <strong>{passageToDelete.title}</strong> sẽ bị xóa vĩnh
              viễn cùng toàn bộ câu hỏi bên trong.
            </>
          ) : null
        }
        onOpenChange={(open) => {
          if (!open) setPassageToDelete(null);
        }}
        onConfirm={async () => {
          if (!passageToDelete) return;
          await controller.deletePassage(passageToDelete);
          setPassageToDelete(null);
        }}
      />
    </div>
  );
}
