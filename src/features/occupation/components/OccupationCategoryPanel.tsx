import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OccupationCategory } from "@/api/occupationCategoryApi";

import OccupationRowActionMenu from "@/features/occupation/components/OccupationRowActionMenu";
import OccupationStatusChip from "@/features/occupation/components/OccupationStatusChip";

interface OccupationCategoryPanelProps {
  categories: OccupationCategory[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
  activeCount: number;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: () => void;
  onEditCategory: (category: OccupationCategory) => void;
  onToggleCategoryStatus: (category: OccupationCategory) => void;
  onDeleteCategory: (category: OccupationCategory) => void;
}

function CategorySkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3"
        >
          <Skeleton className="size-2.5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="size-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function OccupationCategoryPanel({
  categories,
  selectedCategoryId,
  isLoading,
  error,
  activeCount,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onToggleCategoryStatus,
  onDeleteCategory,
}: OccupationCategoryPanelProps) {
  return (
    <Card className="h-full overflow-visible border-border shadow-sm">
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="font-heading text-lg font-semibold">
              Nhóm ngành
            </CardTitle>
            <CardDescription>
              Tổng {categories.length} nhóm, {activeCount} đang hoạt động
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCreateCategory}
          >
            <Plus className="size-4" />
            Thêm nhóm
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 py-4">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading && categories.length === 0 ? <CategorySkeletonList /> : null}

        {!error && !isLoading && categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <p className="font-medium text-foreground">
              Chưa có nhóm ngành nào
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy tạo nhóm đầu tiên để bắt đầu quản lý occupation.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={onCreateCategory}
            >
              <Plus className="size-4" />
              Thêm nhóm
            </Button>
          </div>
        ) : null}

        {categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => {
              const selected = category._id === selectedCategoryId;

              return (
                <div
                  key={category._id}
                  className={cn(
                    "group flex items-start gap-2 rounded-2xl border px-3 py-3 transition-all",
                    selected
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:bg-muted/40",
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    onClick={() => onSelectCategory(category._id)}
                  >
                    <span
                      className={cn(
                        "mt-1 size-2.5 shrink-0 rounded-full border",
                        selected
                          ? "border-primary bg-primary"
                          : "border-border bg-background",
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">
                          {category.name}
                        </span>
                        <OccupationStatusChip active={category.isActive} />
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {category.description || "Không có mô tả."}
                      </p>
                    </div>
                  </button>

                  <OccupationRowActionMenu
                    actions={[
                      {
                        label: "Sửa",
                        onClick: () => onEditCategory(category),
                      },
                      {
                        label: category.isActive ? "Ẩn" : "Hiện",
                        onClick: () => onToggleCategoryStatus(category),
                      },
                      {
                        label: "Xóa",
                        onClick: () => onDeleteCategory(category),
                        destructive: true,
                      },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
