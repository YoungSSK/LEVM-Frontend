import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import readingQuestionApi from "@/api/readingQuestionApi";
import type { ReadingQuestion, ReadingQuestionSet } from "@/api/readingQuestionApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReadingQuestionFormDialog from "./ReadingQuestionFormDialog";

interface SortableQuestionItemProps {
  question: ReadingQuestion;
  index: number;
  onEdit: (question: ReadingQuestion) => void;
  onDelete: (question: ReadingQuestion) => void;
}

function SortableQuestionItem({
  question,
  index,
  onEdit,
  onDelete,
}: SortableQuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Question Info */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-muted-foreground">
            #{index + 1}
          </span>
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            {question.questionType}
          </Badge>
          {question.locationInPassage && (
            <Badge variant="secondary" className="text-[10px]">
              {question.locationInPassage}
            </Badge>
          )}
          <span className="text-xs font-semibold text-emerald-600 ml-auto">
            {question.points || 1} pt
          </span>
        </div>

        <p className="font-medium text-sm text-foreground leading-relaxed">
          {question.questionText}
        </p>

        {/* Answer preview */}
        {question.options && question.options.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            {question.options.map((opt) => (
              <span
                key={opt.key}
                className={`rounded-md px-2 py-0.5 border ${
                  opt.isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 font-medium"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {opt.key}. {opt.text}
              </span>
            ))}
          </div>
        )}

        {question.correctAnswer && (
          <p className="text-xs text-emerald-600 font-medium pt-0.5">
            Đáp án:{" "}
            {Array.isArray(question.correctAnswer)
              ? question.correctAnswer.join(" / ")
              : String(question.correctAnswer)}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(question)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(question)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function ReadingQuestionBuilder({
  passageId,
  onQuestionsChanged,
}: {
  passageId: string;
  onQuestionsChanged?: () => void;
}) {
  const [sets, setSets] = useState<ReadingQuestionSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<ReadingQuestion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; failed: number } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const loadQuestionSets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await readingQuestionApi.getSetsByPassage(passageId);
      setSets(result);
      if (result.length > 0) {
        if (!selectedSetId) {
          setSelectedSetId(result[0]._id);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error("Lỗi tải bộ câu hỏi");
      setLoading(false);
    }
  }, [passageId, selectedSetId]);

  const loadQuestions = useCallback(async (setId: string, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await readingQuestionApi.getBySet(setId, { includeAnswers: true });
      setQuestions(data);
    } catch (err) {
      toast.error("Lỗi tải danh sách câu hỏi");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestionSets();
  }, [loadQuestionSets]);

  useEffect(() => {
    if (selectedSetId) {
      void loadQuestions(selectedSetId);
    }
  }, [selectedSetId, loadQuestions]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedSetId) return;

    const oldIndex = questions.findIndex((q) => q._id === active.id);
    const newIndex = questions.findIndex((q) => q._id === over.id);

    const reordered = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reordered);

    const orders = reordered.map((q, idx) => ({
      questionId: q._id,
      order: idx,
    }));

    try {
      await readingQuestionApi.reorder(selectedSetId, orders);
      toast.success("Đã cập nhật thứ tự câu hỏi.");
      onQuestionsChanged?.();
    } catch (err) {
      toast.error("Lỗi cập nhật thứ tự câu hỏi");
      void loadQuestions(selectedSetId);
    }
  };

  const handleSaveQuestion = async (payload: any) => {
    if (!selectedSetId) return;

    try {
      if (editingQuestion) {
        await readingQuestionApi.update(editingQuestion._id, payload);
        toast.success("Đã cập nhật câu hỏi.");
      } else {
        await readingQuestionApi.create(selectedSetId, payload);
        toast.success("Đã thêm câu hỏi mới.");
      }
      setIsFormOpen(false);
      setEditingQuestion(null);
      await loadQuestions(selectedSetId);
      onQuestionsChanged?.();
    } catch (err) {
      toast.error("Lỗi lưu câu hỏi");
    }
  };

  const handleDeleteQuestion = async (q: ReadingQuestion) => {
    if (!selectedSetId) return;
    const previousQuestions = [...questions];

    // Optimistically remove question instantly
    setQuestions((prev) => prev.filter((item) => item._id !== q._id));
    toast.success("Đã xóa câu hỏi.");

    try {
      await readingQuestionApi.delete(q._id);
      onQuestionsChanged?.();
    } catch (err) {
      // Rollback on error
      setQuestions(previousQuestions);
      toast.error("Lỗi xóa câu hỏi");
    }
  };

  const handleExportCsv = async () => {
    if (!selectedSetId) return;
    try {
      const blob = await readingQuestionApi.exportCsv(selectedSetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reading-questions-${selectedSetId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Lỗi xuất file CSV");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await readingQuestionApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reading-questions-template.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Lỗi tải template CSV");
    }
  };

  const handleImportCsv = async (file: File) => {
    if (!selectedSetId) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await readingQuestionApi.importCsv(selectedSetId, file);
      setImportResult({ inserted: res.inserted, failed: res.failed });
      if (res.failed > 0 && res.inserted === 0) {
        const firstErr = res.errors?.[0]?.message || "Vui lòng kiểm tra lại định dạng file CSV";
        toast.error(`Import thất bại: ${firstErr}`);
      } else {
        toast.success(`Đã import ${res.inserted} câu hỏi (${res.failed} lỗi).`);
      }
      await loadQuestions(selectedSetId);
      onQuestionsChanged?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Lỗi import CSV";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Set Bar & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Bộ câu hỏi:</p>
          {sets.map((set) => (
            <Button
              key={set._id}
              variant={set._id === selectedSetId ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSetId(set._id)}
            >
              {set.title} ({set.questionCount})
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
          >
            <Download className="mr-1.5 size-3.5" />
            Template CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selectedSetId || importing}
            onClick={() => importInputRef.current?.click()}
          >
            {importing ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 size-3.5" />
            )}
            Import CSV
          </Button>

          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleImportCsv(file);
                e.target.value = "";
              }
            }}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selectedSetId || questions.length === 0}
            onClick={handleExportCsv}
          >
            <Download className="mr-1.5 size-3.5" />
            Export CSV
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!selectedSetId}
            onClick={() => {
              setEditingQuestion(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-3.5" />
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {/* Import Result Banner */}
      {importResult ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            importResult.failed > 0
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-emerald-300 bg-emerald-50 text-emerald-900"
          }`}
        >
          <p className="font-semibold">
            Kết quả Import: Đã thêm {importResult.inserted} câu hỏi
            {importResult.failed > 0 && `, thất bại ${importResult.failed} câu`}.
          </p>
        </div>
      ) : null}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          Đang tải danh sách câu hỏi...
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-12 text-center">
          <HelpCircle className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 font-semibold text-foreground">
            Chưa có câu hỏi nào trong bộ này
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hãy thêm câu hỏi mới thủ công hoặc import từ file CSV.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={() => {
              setEditingQuestion(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-3.5" />
            Thêm câu hỏi đầu tiên
          </Button>
        </div>
      ) : (
        /* Drag and drop sortable list */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <SortableQuestionItem
                  key={q._id}
                  question={q}
                  index={idx}
                  onEdit={(item) => {
                    setEditingQuestion(item);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Question Form Dialog */}
      {isFormOpen && (
        <ReadingQuestionFormDialog
          open={isFormOpen}
          mode={editingQuestion ? "edit" : "create"}
          question={editingQuestion}
          isSubmitting={false}
          onOpenChange={(open) => {
            if (!open) {
              setIsFormOpen(false);
              setEditingQuestion(null);
            }
          }}
          onSubmit={handleSaveQuestion}
        />
      )}
    </div>
  );
}
