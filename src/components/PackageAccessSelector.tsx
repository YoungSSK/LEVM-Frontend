import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePackageStore } from "@/stores/PackageStore";
import type { Package } from "@/api/packageApi";

interface PackageAccessSelectorProps {
  /** IDs của các gói đang được gán cho nội dung hiện tại */
  value: string[];
  /** Callback khi danh sách thay đổi */
  onChange: (ids: string[]) => void;
  /** Hiển thị loading state */
  disabled?: boolean;
}

/**
 * Multi-select component cho "Gói được phép truy cập".
 * Dùng chung cho 3 form edit: GrammarLesson, VocabularyLesson, ReadingPassage.
 *
 * Cách dùng:
 *   <PackageAccessSelector
 *     value={selectedPackageIds}
 *     onChange={setSelectedPackageIds}
 *   />
 */
export default function PackageAccessSelector({
  value,
  onChange,
  disabled = false,
}: PackageAccessSelectorProps) {
  const { packages, isLoading, fetchAll } = usePackageStore();

  useEffect(() => {
    if (packages.length === 0) {
      fetchAll(true).catch(() => {
        toast.error("Không tải được danh sách gói thành viên");
      });
    }
  }, []);

  const togglePackage = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const activePackages = packages.filter((p) => p.isActive);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Gói thành viên được phép truy cập
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Đang tải danh sách gói...
        </div>
      ) : (
        <div className="space-y-2">

          {/* Active packages from DB */}
          {activePackages.map((pkg: Package) => {
            const selected = value.includes(pkg._id);
            return (
              <button
                key={pkg._id}
                type="button"
                disabled={disabled}
                onClick={() => togglePackage(pkg._id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-muted/10 hover:border-primary/40"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div
                  className={`h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center ${
                    selected ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {selected && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{pkg.name}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-mono">
                      Lv.{pkg.level}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pkg.price.toLocaleString("vi-VN")}₫
                      {pkg.durationInDays ? `/${pkg.durationInDays} ngày` : " (vĩnh viễn)"}
                    </span>
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {pkg.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {activePackages.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground italic">
              Chưa có gói nào. Tạo gói tại trang Quản lý Gói.
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        ✓ Chọn gói Level X = Tất cả học viên có gói từ Level X trở lên (Ví dụ: chọn Level 2 thì Level 2, 3, 4, 5... đều xem được).
        <br />✓ Không chọn gói nào = Bài học Free (tất cả học viên đều được học).
      </p>
    </div>
  );
}
