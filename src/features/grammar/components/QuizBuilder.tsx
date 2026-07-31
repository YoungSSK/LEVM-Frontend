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
  X,
  Check,
  FileText,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";

import grammarQuizApi from "@/api/grammarQuizApi";
import type {
  GrammarQuizQuestionAdmin,
  CreateGrammarQuizQuestionPayload,
  UpdateGrammarQuizQuestionPayload,
} from "@/api/grammarQuizApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** Một câu hỏi đang ở trạng thái form (create/edit). */
interface QuestionDraft {
  _temp?: string;
  _id?: string;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

/** Câu hỏi đã load từ API (hoặc đang chờ save). */
type QuestionItem =
  | GrammarQuizQuestionAdmin
  | QuestionDraft;

function newDraft(): QuestionDraft {
  return {
    _temp: crypto.randomUUID(),
    questionText: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
    explanation: "",
  };
}

export default function QuizBuilder({
  lessonId,
  onQuizChanged,
}: {
  lessonId: string;
  /** Called after questions are created, updated, deleted, or imported. */
  onQuizChanged?: () => void;
}) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [importResult, setImportResult] = useState<{
    inserted: number;
    failed: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load câu hỏi từ API.
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await grammarQuizApi.list(lessonId);
      setQuestions(data);
    } catch {
      toast.error("Không tải được câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQuestions();
  }, [loadQuestions]);

  // Download CSV template.
  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const blob = await grammarQuizApi.downloadCsvTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grammar-quiz-template.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không tải được file mẫu",
      );
    } finally {
      setDownloading(false);
    }
  };

  // Import CSV.
  const handleImportCsv = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const result = await grammarQuizApi.importCsv(lessonId, file);
      setImportResult(result);
      await loadQuestions();
      toast.success(`Đã import ${result.inserted} câu hỏi`);
      onQuizChanged?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Import thất bại";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  // Reorder (drag-drop).
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = questions.findIndex(
      (q) => ("_id" in q ? q._id : ("_temp" in q ? q._temp : "")) === active.id,
    );
    const newIdx = questions.findIndex(
      (q) => ("_id" in q ? q._id : ("_temp" in q ? q._temp : "")) === over.id,
    );
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(questions, oldIdx, newIdx);
    setQuestions(reordered);
    // Sync order to backend.
    const orders = reordered.map((q, i) => ({
      questionId: "_id" in q ? q._id : ("_temp" in q ? q._temp : ""),
      order: i,
    }));
    void grammarQuizApi
      .reorder(lessonId, orders)
      .then(() => toast.success("Đã cập nhật thứ tự"))
      .catch(() => toast.error("Lỗi khi cập nhật thứ tự"));
  };

  // Add new question.
  const handleAdd = () => {
    const draft = newDraft();
    setQuestions((prev) => [...prev, draft]);
    setEditingId(draft._temp);
  };

  // Save draft (create or update).
  const handleSave = async (draft: QuestionDraft) => {
    if (!draft.questionText.trim()) {
      toast.error("Đề bài không được để trống");
      return;
    }
    const validOptions = draft.options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      toast.error("Cần ít nhất 2 đáp án");
      return;
    }
    const hasCorrect = validOptions.some((o) => o.isCorrect);
    if (!hasCorrect) {
      toast.error("Phải có đúng 1 đáp án đúng");
      return;
    }

    const payload: CreateGrammarQuizQuestionPayload | UpdateGrammarQuizQuestionPayload =
      {
        questionText: draft.questionText.trim(),
        options: validOptions.map((o) => ({
          text: o.text.trim(),
          isCorrect: o.isCorrect,
        })),
        explanation: draft.explanation.trim(),
      };

    const tempId = draft._temp;
    setSavingIds((s) => new Set(s).add(tempId));
    try {
      let saved: GrammarQuizQuestionAdmin;
      if (draft._id) {
        saved = await grammarQuizApi.update(draft._id, payload);
      } else {
        saved = await grammarQuizApi.create(lessonId, payload);
      }
      setQuestions((prev) =>
        prev.map((q) =>
          ("_temp" in q && q._temp === tempId) ||
          ("_id" in q && q._id === saved._id)
            ? saved
            : q,
        ),
      );
      setEditingId(null);
      toast.success(draft._id ? "Đã cập nhật câu hỏi" : "Đã tạo câu hỏi");
      onQuizChanged?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Lỗi khi lưu";
      toast.error(msg);
    } finally {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(tempId);
        return n;
      });
    }
  };

  // Delete question.
  const handleDelete = async (id: string) => {
    try {
      await grammarQuizApi.remove(id);
      setQuestions((prev) =>
        prev.filter(
          (q) =>
            !(
              ("_id" in q && q._id === id) ||
              ("_temp" in q && q._temp === id)
            ),
        ),
      );
      toast.success("Đã xoá câu hỏi");
      onQuizChanged?.();
    } catch {
      toast.error("Lỗi khi xoá câu hỏi");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold">
          Câu hỏi trắc nghiệm
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({questions.length})
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={downloading}
          >
            <Download className="mr-1.5 size-3.5" />
            {downloading ? "Đang tải..." : "Tải file mẫu CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => importInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 size-3.5" />
            )}
            Nhập từ CSV
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
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1.5 size-3.5" />
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {/* Import result */}
      {importResult ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            importResult.failed > 0
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-emerald-300 bg-emerald-50 text-emerald-900"
          }`}
        >
          <p className="font-medium">
            Import: {importResult.inserted} thành công
            {importResult.failed > 0
              ? `, ${importResult.failed} lỗi`
              : ""}
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-xs">
              {importResult.errors.slice(0, 5).map((e) => (
                <li key={e.row}>
                  Dòng {e.row}: {e.message}
                </li>
              ))}
              {importResult.errors.length > 5 && (
                <li>... và {importResult.errors.length - 5} lỗi khác</li>
              )}
            </ul>
          )}
        </div>
      ) : null}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Đang tải câu hỏi...
        </div>
      ) : questions.length === 0 && !editingId ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          <FileText className="mx-auto mb-2 size-8 opacity-30" />
          Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" hoặc "Nhập từ CSV".
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) =>
              "_id" in q ? q._id : "_temp" in q ? q._temp! : "",
            )}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {questions.map((q) => {
                const id =
                  "_id" in q ? q._id : "_temp" in q ? q._temp! : "";
                const isEditing =
                  editingId === id ||
                  ("_temp" in q && !("_id" in q));
                const isSaving = savingIds.has(id);
                if (isEditing) {
                  return (
                    <QuestionForm
                      key={id}
                      draft={"_temp" in q ? q : undefined}
                      saved={"_id" in q ? q : undefined}
                      isSaving={isSaving}
                      onSave={(draft) => void handleSave(draft)}
                      onCancel={() => {
                        setEditingId(null);
                        if (!("_id" in q)) {
                          setQuestions((prev) =>
                            prev.filter(
                              (p) =>
                                !(
                                  "_temp" in p &&
                                  "_temp" in q &&
                                  p._temp === q._temp
                                ),
                            ),
                          );
                        }
                      }}
                    />
                  );
                }
                return (
                  <SortableQuestionCard
                    key={id}
                    question={q}
                    onEdit={() => setEditingId(id)}
                    onDelete={() => void handleDelete(id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ===== Sortable card =====

function SortableQuestionCard({
  question,
  onEdit,
  onDelete,
}: {
  question: QuestionItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const id =
    "_id" in question ? question._id : "_temp" in question ? question._temp! : "";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 cursor-grab touch-manipulation text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium">{question.questionText}</p>
          <div className="flex flex-wrap gap-2">
            {question.options.map((opt, i) => (
              <span
                key={i}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  opt.isCorrect
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {opt.text}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== Inline form =====

function QuestionForm({
  draft,
  saved,
  isSaving,
  onSave,
  onCancel,
}: {
  draft?: QuestionDraft;
  saved?: GrammarQuizQuestionAdmin;
  isSaving: boolean;
  onSave: (d: QuestionDraft) => void;
  onCancel: () => void;
}) {
  const [questionText, setQuestionText] = useState(
    saved?.questionText ?? draft?.questionText ?? "",
  );
  const [options, setOptions] = useState<
    { text: string; isCorrect: boolean }[]
  >(
    saved?.options ?? draft?.options ?? [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  );
  const [explanation, setExplanation] = useState(
    saved?.explanation ?? draft?.explanation ?? "",
  );
  const [expanded, setExpanded] = useState(true);

  const addOption = () => {
    if (options.length < 6)
      setOptions((o) => [...o, { text: "", isCorrect: false }]);
  };

  const removeOption = (idx: number) => {
    setOptions((o) => o.filter((_, i) => i !== idx));
  };

  const setCorrect = (idx: number) => {
    setOptions((o) => o.map((opt, i) => ({ ...opt, isCorrect: i === idx })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ _temp: draft?._temp, _id: saved?._id, questionText, options, explanation });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
          {saved ? "Chỉnh sửa" : "Tạo mới"}
        </button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Check className="mr-1 size-3.5" />
            )}
            {saved ? "Lưu" : "Tạo"}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Đề bài</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập đề bài..."
              className="min-h-[60px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">
                Đáp án{" "}
                <span className="font-normal text-muted-foreground">
                  (click chọn đúng)
                </span>
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={addOption}
                >
                  + Thêm đáp án
                </button>
              )}
            </div>

            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(i)}
                  className={`size-4 shrink-0 rounded-full border-2 transition-colors ${
                    opt.isCorrect
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-muted-foreground/30"
                  }`}
                  title="Chọn đáp án đúng"
                />
                <Input
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...options];
                    next[i].text = e.target.value;
                    setOptions(next);
                  }}
                  placeholder={`Đáp án ${i + 1}`}
                  className="flex-1 text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Giải thích</label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích hiển thị sau khi nộp bài..."
              className="min-h-[48px] text-sm"
            />
          </div>
        </div>
      )}
    </form>
  );
}
