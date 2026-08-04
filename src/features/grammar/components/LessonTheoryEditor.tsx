import { useEffect, useMemo, useRef, useState } from "react";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { CheckCircle2, Loader2, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";

import grammarLessonApi from "@/api/grammarLessonApi";
import { Button } from "@/components/ui/button";

/**
 * LessonTheoryEditor — rich text editor cho htmlContent.
 *
 * Tính năng:
 *  - TipTap (StarterKit + Placeholder).
 *  - Load htmlContent ban đầu + render.
 *  - Nút "Xác nhận lưu" trực tiếp + Autosave: debounce 1.5s sau khi ngừng gõ -> PUT /grammar-lessons/:id/content.
 *  - Trạng thái: idle | saving | saved | conflict | error.
 *  - Optimistic locking: gửi lastKnownContentUpdatedAt; nếu server 409 -> cảnh báo.
 */
export default function LessonTheoryEditor({
  lessonId,
  initialHtml,
  initialContentUpdatedAt,
}: {
  lessonId: string;
  initialHtml: string;
  initialContentUpdatedAt?: string | null;
}) {
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error" | "conflict"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialContentUpdatedAt ? new Date(initialContentUpdatedAt) : null,
  );
  const [lastErrorMsg, setLastErrorMsg] = useState<string | null>(null);
  const [forceShowReload, setForceShowReload] = useState(false);
  // eslint-disable-next-line react-hooks/purity -- stable capture of mount time for useMemo
  const loadedAtRef = useRef(Date.now());

  const lastKnownUpdatedAtRef = useRef<string | null>(
    initialContentUpdatedAt ?? null,
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Bắt đầu viết nội dung bài học tại đây...",
      }),
    ],
    content: initialHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none min-h-[320px] focus:outline-none px-4 py-3",
      },
    },
    onUpdate: ({ editor: ed }) => {
      scheduleSave(ed);
    },
    immediatelyRender: false,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pendingHtmlRef = useRef<string | null>(null);
  const saveRequestIdRef = useRef(0); // chống race condition: đếm request

  const scheduleSave = (ed: Editor) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSaveState((s) => (s === "saved" ? "saved" : "idle"));
    pendingHtmlRef.current = ed.getHTML();
    const currentRequestId = ++saveRequestIdRef.current; // gán trước khi setTimeout
    debounceTimerRef.current = setTimeout(() => {
      void persist(ed.getHTML(), currentRequestId);
    }, 1500);
  };

  const persist = async (html: string, requestId: number) => {
    if (inFlightRef.current) return; // tránh gọi chồng
    inFlightRef.current = true;
    setSaveState("saving");
    setLastErrorMsg(null);

    try {
      const res = await grammarLessonApi.updateContent(
        lessonId,
        html,
        lastKnownUpdatedAtRef.current,
      );
      // Chỉ cập nhật UI nếu đây là request mới nhất.
      if (requestId !== saveRequestIdRef.current) return;
      lastKnownUpdatedAtRef.current = res.contentUpdatedAt;
      const now = new Date(res.contentUpdatedAt);
      setLastSavedAt(now);
      setSaveState("saved");
      setForceShowReload(false);
    } catch (err: unknown) {
      if (requestId !== saveRequestIdRef.current) return; // bỏ qua request cũ
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Lỗi không xác định";
      if (status === 409) {
        setSaveState("conflict");
        setForceShowReload(true);
        // Tự động tải nội dung mới nhất từ server.
        void reloadContentFromServer();
      } else {
        setSaveState("error");
        setLastErrorMsg(msg);
      }
    } finally {
      inFlightRef.current = false;
    }
  };

  const handleManualSave = async () => {
    if (!editor) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const html = editor.getHTML();
    const currentRequestId = ++saveRequestIdRef.current;
    await persist(html, currentRequestId);
    toast.success("Lưu lý thuyết bài học thành công!");
  };

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const statusLabel = useMemo(() => {
    switch (saveState) {
      case "saving":
        return "Đang lưu...";
      case "saved":
        return lastSavedAt
          ? `Đã lưu lúc ${formatTime(lastSavedAt)}`
          : "Đã lưu";
      case "error":
        return lastErrorMsg || "Lỗi khi lưu";
      case "conflict":
        return "Nội dung đã bị chỉnh sửa bởi người khác";
      default:
        return lastSavedAt
          ? `Đã lưu lúc ${formatTime(lastSavedAt)}`
          : "Chưa lưu lần nào";
    }
  }, [saveState, lastSavedAt, lastErrorMsg]);

  const recentEditBanner = useMemo(() => {
    if (forceShowReload) return null;
    if (!initialContentUpdatedAt) return null;
    // eslint-disable-next-line react-hooks/refs -- intentional read of mount time ref in memo
    const ageMs = loadedAtRef.current - new Date(initialContentUpdatedAt).getTime();
    if (ageMs > 2 * 60 * 1000) return null;
    return { ageMs, when: new Date(initialContentUpdatedAt) };
  }, [initialContentUpdatedAt, forceShowReload]);

  const reloadContentFromServer = async () => {
    try {
      const lesson = await grammarLessonApi.getById(lessonId);
      editor?.commands.setContent(lesson.htmlContent ?? "", false);
      lastKnownUpdatedAtRef.current = lesson.contentUpdatedAt ?? null;
      setForceShowReload(false);
    } catch {
      // Nếu reload lỗi, vẫn giữ nguyên conflict banner.
    }
  };

  const handleReload = () => {
    void reloadContentFromServer();
  };

  if (!editor) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-xs">
        <Toolbar editor={editor} />
        <div className="flex items-center gap-3">
          <SaveBadge state={saveState} label={statusLabel} />
          <Button
            type="button"
            size="sm"
            onClick={() => void handleManualSave()}
            disabled={saveState === "saving"}
            className="h-8 gap-1.5 px-3 text-xs font-medium"
          >
            {saveState === "saving" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Lưu lý thuyết
          </Button>
        </div>
      </div>

      {recentEditBanner ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          <span>
            Nội dung vừa được chỉnh sửa lúc{" "}
            <strong>{formatTime(recentEditBanner.when)}</strong> bởi người
            khác. Hãy cẩn thận trước khi lưu.
          </span>
        </div>
      ) : null}

      {forceShowReload ? (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          <div className="flex-1">
            <p>
              Nội dung đã được cập nhật bởi người khác. Phiên bản mới nhất đã
              được tải về.
            </p>
            <p className="mt-1 opacity-80">
              Bạn có thể tiếp tục chỉnh sửa — lưu sẽ ghi đè phiên bản mới.
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleReload}
              >
                Tải lại
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setForceShowReload(false)}
              >
                Tiếp tục chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <EditorContent editor={editor} />
      </div>

      {/* Main Save Action Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SaveBadge state={saveState} label={statusLabel} />
        </div>
        <Button
          type="button"
          onClick={() => void handleManualSave()}
          disabled={saveState === "saving"}
          className="gap-2 font-semibold shadow-sm"
        >
          {saveState === "saving" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Xác nhận lưu lý thuyết
        </Button>
      </div>
    </div>
  );
}

type ToolbarBtnProps = {
  onClick: () => void;
  active?: boolean;
  label: string;
};

function ToolbarBtn({ onClick, active, label }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="B"
      />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="I"
      />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="S"
      />
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarBtn
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        label="H2"
      />
      <ToolbarBtn
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        label="H3"
      />
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="• List"
      />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="1. List"
      />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="❝ Quote"
      />
      <span className="mx-1 h-4 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="— HR —"
      />
      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        label="↶ Undo"
      />
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        label="↷ Redo"
      />
    </div>
  );
}

function SaveBadge({
  state,
  label,
}: {
  state: "idle" | "saving" | "saved" | "error" | "conflict";
  label: string;
}) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        {label}
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600">
        <CheckCircle2 className="size-3" />
        {label}
      </span>
    );
  }
  if (state === "error" || state === "conflict") {
    return (
      <span className="flex items-center gap-1.5 text-destructive">
        <AlertTriangle className="size-3" />
        {label}
      </span>
    );
  }
  return <span className="text-muted-foreground">{label}</span>;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
