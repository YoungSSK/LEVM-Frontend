import { useState } from "react";
import { BookOpen, ListChecks } from "lucide-react";

import LessonTheoryEditor from "@/features/grammar/components/LessonTheoryEditor";
import QuizBuilder from "@/features/grammar/components/QuizBuilder";
import type { GrammarLessonDetail } from "@/api/grammarLessonApi";

type Tab = "theory" | "quiz";

/**
 * GrammarLessonAdminTabs — wrap Theory Editor + Quiz Builder trong 1 component.
 *
 * Mỗi lesson hiển thị 2 tab:
 *  - "Lý thuyết": LessonTheoryEditor (TipTap + autosave).
 *  - "Trắc nghiệm": QuizBuilder (CRUD câu hỏi + CSV import).
 *
 * Props `lesson` cần có: _id, htmlContent, contentUpdatedAt, hasQuiz.
 */
export default function GrammarLessonAdminTabs({
  lesson,
}: {
  lesson: Pick<
    GrammarLessonDetail,
    "_id" | "htmlContent" | "contentUpdatedAt" | "hasQuiz"
  >;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("theory");

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-2xl border border-border p-1">
        <TabButton
          active={activeTab === "theory"}
          onClick={() => setActiveTab("theory")}
          icon={<BookOpen className="size-4" />}
          label="Lý thuyết"
        />
        <TabButton
          active={activeTab === "quiz"}
          onClick={() => setActiveTab("quiz")}
          icon={<ListChecks className="size-4" />}
          label="Trắc nghiệm"
          badge={lesson.hasQuiz ? undefined : "mới"}
        />
      </div>

      {activeTab === "theory" && (
        <LessonTheoryEditor
          lessonId={lesson._id}
          initialHtml={lesson.htmlContent}
          initialContentUpdatedAt={lesson.contentUpdatedAt}
        />
      )}

      {activeTab === "quiz" && (
        <QuizBuilder lessonId={lesson._id} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {badge ? (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
