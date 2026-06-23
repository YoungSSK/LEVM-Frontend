import { Briefcase } from "lucide-react";
import { useOccupationPageController } from "@/features/occupation/hooks/useOccupationPageController";

import OccupationCategoryPanel from "@/features/occupation/components/OccupationCategoryPanel";
import OccupationCategorySheet from "@/features/occupation/components/OccupationCategorySheet";
import OccupationOccupationPanel from "@/features/occupation/components/OccupationOccupationPanel";
import OccupationOccupationSheet from "@/features/occupation/components/OccupationOccupationSheet";

export default function OccupationMasterDetail() {
  const controller = useOccupationPageController();
  const isCategorySheetOpen = controller.categoryEditor !== null;
  const isOccupationSheetOpen = controller.occupationEditor !== null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              <Briefcase className="size-4" />
              Occupation
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold">
                Occupation Management
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70">
                Quản lý nhóm ngành nghề và ngành nghề
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[18rem]">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-none backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                Nhóm ngành
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {controller.categories.length}
              </div>
              <div className="mt-1 text-xs text-white/60">
                {controller.activeCategoryCount} đang hoạt động
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-none backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                Ngành nghề
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {controller.occupations.length}
              </div>
              <div className="mt-1 text-xs text-white/60">
                {controller.activeOccupationCount} đang hoạt động
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <OccupationCategoryPanel
          categories={controller.categories}
          selectedCategoryId={controller.selectedCategoryId}
          isLoading={controller.isCategoriesLoading}
          error={controller.categoriesError}
          activeCount={controller.activeCategoryCount}
          onSelectCategory={controller.selectCategory}
          onCreateCategory={controller.openCreateCategory}
          onEditCategory={controller.openEditCategory}
          onToggleCategoryStatus={controller.toggleCategoryStatus}
          onDeleteCategory={controller.deleteCategory}
        />

        <OccupationOccupationPanel
          occupations={controller.occupations}
          selectedOccupationId={controller.selectedOccupationId}
          selectedCategory={controller.selectedCategory}
          isLoading={controller.isOccupationsLoading}
          error={controller.occupationsError}
          activeCount={controller.activeOccupationCount}
          onSelectOccupation={controller.selectOccupation}
          onCreateOccupation={controller.openCreateOccupation}
          onEditOccupation={controller.openEditOccupation}
          onToggleOccupationStatus={controller.toggleOccupationStatus}
        />
      </div>

      {isCategorySheetOpen ? (
        <OccupationCategorySheet
          key={
            controller.categoryEditor?.mode === "edit"
              ? `edit-${controller.categoryEditor.category._id}`
              : "create-category"
          }
          open={isCategorySheetOpen}
          mode={controller.categoryEditor?.mode ?? "create"}
          initialName={
            controller.categoryEditor?.mode === "edit"
              ? controller.categoryEditor.category.name
              : ""
          }
          initialDescription={
            controller.categoryEditor?.mode === "edit"
              ? controller.categoryEditor.category.description
              : ""
          }
          isSubmitting={controller.isSavingCategory}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeCategoryEditor();
            }
          }}
          onSubmit={controller.saveCategory}
        />
      ) : null}

      {isOccupationSheetOpen ? (
        <OccupationOccupationSheet
          key={
            controller.occupationEditor?.mode === "edit"
              ? `edit-${controller.occupationEditor.occupation._id}`
              : "create-occupation"
          }
          open={isOccupationSheetOpen}
          mode={controller.occupationEditor?.mode ?? "create"}
          categories={controller.categories}
          initialCategoryId={
            controller.occupationEditor?.mode === "edit"
              ? controller.occupationEditor.occupation.categoryId
              : (controller.selectedCategoryId ?? "")
          }
          initialName={
            controller.occupationEditor?.mode === "edit"
              ? controller.occupationEditor.occupation.name
              : ""
          }
          initialDescription={
            controller.occupationEditor?.mode === "edit"
              ? controller.occupationEditor.occupation.description
              : ""
          }
          initialIsActive={
            controller.occupationEditor?.mode === "edit"
              ? controller.occupationEditor.occupation.isActive
              : true
          }
          isSubmitting={controller.isSavingOccupation}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeOccupationEditor();
            }
          }}
          onSubmit={controller.saveOccupation}
        />
      ) : null}
    </div>
  );
}
