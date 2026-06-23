import { Plus } from "lucide-react";

import type { Occupation } from "@/api/occupationApi";
import type { OccupationCategory } from "@/api/occupationCategoryApi";
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

import OccupationRowActionMenu from "@/features/occupation/components/OccupationRowActionMenu";
import OccupationStatusChip from "@/features/occupation/components/OccupationStatusChip";

interface OccupationOccupationPanelProps {
  occupations: Occupation[];
  selectedOccupationId: string | null;
  selectedCategory: OccupationCategory | null;
  isLoading: boolean;
  error: string | null;
  activeCount: number;
  onSelectOccupation: (occupationId: string) => void;
  onCreateOccupation: () => void;
  onEditOccupation: (occupation: Occupation) => void;
  onToggleOccupationStatus: (occupation: Occupation) => void;
}

function OccupationSkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3"
        >
          <Skeleton className="size-2.5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="size-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function OccupationOccupationPanel({
  occupations,
  selectedOccupationId,
  selectedCategory,
  isLoading,
  error,
  activeCount,
  onSelectOccupation,
  onCreateOccupation,
  onEditOccupation,
  onToggleOccupationStatus,
}: OccupationOccupationPanelProps) {
  const isActionDisabled = !selectedCategory;

  return (
    <Card className="h-full overflow-visible border-border shadow-sm">
      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="font-heading text-lg font-semibold">
              Ngành nghề thuộc nhóm "
              {selectedCategory?.name ?? "chua chon nhom nao"}"
            </CardTitle>
            <CardDescription>
              {selectedCategory
                ? `Đang xem: ${selectedCategory.name} - tổng ${occupations.length} mục, ${activeCount} đang hoạt động`
                : "Hãy chọn một nhóm ngành bên trái."}
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCreateOccupation}
            disabled={isActionDisabled}
          >
            <Plus className="size-4" />
            Thêm ngành nghề
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 py-4">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!selectedCategory ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <p className="font-medium text-foreground">Chưa chọn nhóm ngành</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy chọn một nhóm bên trái để xem danh sách ngành nghề.
            </p>
          </div>
        ) : null}

        {isLoading && occupations.length === 0 && selectedCategory ? (
          <OccupationSkeletonList />
        ) : null}

        {selectedCategory &&
        !error &&
        occupations.length === 0 &&
        !isLoading ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <p className="font-medium text-foreground">
              Chưa có ngành nghề nào
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thêm mục đầu tiên cho nhóm "{selectedCategory.name}".
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={onCreateOccupation}
            >
              <Plus className="size-4" />
              Thêm ngành nghề
            </Button>
          </div>
        ) : null}

        {occupations.length > 0 ? (
          <div className="space-y-2">
            {occupations.map((occupation) => {
              const selected = occupation._id === selectedOccupationId;

              return (
                <div
                  key={occupation._id}
                  className={cn(
                    "flex items-start gap-2 rounded-2xl border px-3 py-3 transition-all",
                    selected
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:bg-muted/40",
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    onClick={() => onSelectOccupation(occupation._id)}
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
                          {occupation.name}
                        </span>
                        <OccupationStatusChip active={occupation.isActive} />
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {occupation.description || "Không có mô tả."}
                      </p>
                    </div>
                  </button>

                  <OccupationRowActionMenu
                    actions={[
                      {
                        label: "Sửa",
                        onClick: () => onEditOccupation(occupation),
                      },
                      {
                        label: occupation.isActive ? "Ẩn" : "Hiện",
                        onClick: () => onToggleOccupationStatus(occupation),
                      },
                      {
                        label: "Xoá",
                        onClick: () => undefined,
                        disabled: true,
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
