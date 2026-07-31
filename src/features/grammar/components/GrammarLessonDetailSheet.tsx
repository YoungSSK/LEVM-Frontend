import { useState } from "react";
import { X, BookOpen, ListChecks, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GrammarLessonDetail } from "@/api/grammarLessonApi";
import GrammarLessonAdminTabs from "@/features/grammar/components/GrammarLessonAdminTabs";
import QuizBuilder from "@/features/grammar/components/QuizBuilder";

type Tab = "content" | "quiz";

/**
 * GrammarLessonDetailSheet — panel trượt từ phải.
 *
 * Khi Admin click "Xem chi tiết" trên lesson, sheet này mở ra với 2 tab:
 *  - Tab "Nội dung": LessonTheoryEditor (TipTap + autosave).
 *  - Tab "Trắc nghiệm": QuizBuilder (CRUD câu hỏi + CSV import).
 *
 * Đây là entry-point chính cho luồng "mỗi lesson = Theory + Quiz" mới.
 * GrammarLessonFormDialog vẫn giữ nguyên (chỉ dùng cho metadata + tạo lesson).
 */
export default function GrammarLessonDetailSheet({
  open,
  lesson,
  onClose,
}: {
  open: boolean;
  lesson: GrammarLessonDetail | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("content");

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl sm:max-w-3xl">
        {/* Header */}
        <div className="flex flex-row items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">
            {lesson?.title ?? "Chi tiết bài học"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Loading */}
        {!lesson ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang tải...
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Badge row */}
            <div className="flex flex-wrap gap-2 border-b px-6 py-3">
              <_Badge tone={lesson.isActive ? "success" : "neutral"}>
                {lesson.isActive ? "Đang hoạt động" : "Tạm ẩn"}
              </_Badge>
              <_Badge tone={lesson.isPublished ? "success" : "warning"}>
                {lesson.isPublished ? "Đã xuất bản" : "Bản nháp"}
              </_Badge>
              <_Badge tone={lesson.hasQuiz ? "info" : "neutral"}>
                {lesson.hasQuiz ? "Có quiz" : "Chưa có quiz"}
              </_Badge>
              <_Badge tone="neutral">
                🏆 {lesson.xpReward ?? 10} XP
              </_Badge>
              <_Badge tone="neutral">
                Ngưỡng {lesson.passThreshold ?? 70}%
              </_Badge>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b px-6 pt-3">
              <_TabButton
                active={activeTab === "content"}
                onClick={() => setActiveTab("content")}
              >
                <BookOpen className="size-4" />
                Nội dung
              </_TabButton>
              <_TabButton
                active={activeTab === "quiz"}
                onClick={() => setActiveTab("quiz")}
                badge={lesson.hasQuiz ? undefined : "mới"}
              >
                <ListChecks className="size-4" />
                Trắc nghiệm
              </_TabButton>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === "content" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {lesson.shortDescription || "Chưa có mô tả."}
                  </p>
                  <GrammarLessonAdminTabs lesson={lesson} />
                </div>
              )}
              {activeTab === "quiz" && (
                <QuizBuilder lessonId={lesson._id} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function _TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
      {badge ? (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function _Badge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "info" | "neutral";
  children: React.ReactNode;
}) {
  const classes: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes[tone]}`}
    >
      {children}
    </span>
  );
}
