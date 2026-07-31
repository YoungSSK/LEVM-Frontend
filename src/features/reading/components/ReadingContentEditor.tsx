import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import readingPassageApi from "@/api/readingPassageApi";
import { Button } from "@/components/ui/button";

interface ReadingContentEditorProps {
  passageId: string;
  initialHtml: string;
  initialContentUpdatedAt?: string | null;
}

export default function ReadingContentEditor({
  passageId,
  initialHtml,
  initialContentUpdatedAt,
}: ReadingContentEditorProps) {
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error" | "conflict"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialContentUpdatedAt ? new Date(initialContentUpdatedAt) : null,
  );
  const [lastErrorMsg, setLastErrorMsg] = useState<string | null>(null);
  const lastKnownUpdatedAtRef = useRef<string | null>(
    initialContentUpdatedAt ?? null,
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pendingHtmlRef = useRef<string | null>(null);
  const saveRequestIdRef = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Bắt đầu soạn thảo nội dung bài đọc tại đây. Hệ thống sẽ tự động lưu...",
      }),
    ],
    content: initialHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none min-h-[360px] focus:outline-none px-5 py-4 border border-border rounded-2xl bg-card shadow-inner",
      },
    },
    onUpdate: ({ editor: ed }) => {
      scheduleSave(ed);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialHtml !== undefined) {
      const current = editor.getHTML();
      if (current !== initialHtml) {
        editor.commands.setContent(initialHtml || "");
      }
    }
  }, [editor, initialHtml]);

  const scheduleSave = (ed: Editor) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSaveState((s) => (s === "saved" ? "saved" : "idle"));
    pendingHtmlRef.current = ed.getHTML();
    const currentRequestId = ++saveRequestIdRef.current;
    debounceTimerRef.current = setTimeout(() => {
      void persist(ed.getHTML(), currentRequestId);
    }, 1500);
  };

  const persist = async (html: string, requestId: number) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setSaveState("saving");
    setLastErrorMsg(null);

    try {
      const res = await readingPassageApi.updateContent(passageId, {
        htmlContent: html,
        lastKnownContentUpdatedAt: lastKnownUpdatedAtRef.current,
      });

      if (requestId !== saveRequestIdRef.current) return;
      lastKnownUpdatedAtRef.current = res.contentUpdatedAt;
      setLastSavedAt(new Date(res.contentUpdatedAt));
      setSaveState("saved");
    } catch (err: unknown) {
      if (requestId !== saveRequestIdRef.current) return;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setSaveState("conflict");
      } else {
        setSaveState("error");
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Lỗi lưu tự động";
        setLastErrorMsg(msg);
      }
    } finally {
      inFlightRef.current = false;
      if (
        pendingHtmlRef.current &&
        pendingHtmlRef.current !== html &&
        saveRequestIdRef.current === requestId
      ) {
        void persist(pendingHtmlRef.current, ++saveRequestIdRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const formatSavedTime = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="space-y-3">
      {/* Editor Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <>
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span className="text-muted-foreground">Đang tự động lưu...</span>
            </>
          )}

          {saveState === "saved" && (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">
                Đã lưu tự động
                {lastSavedAt ? ` lúc ${formatSavedTime(lastSavedAt)}` : ""}
              </span>
            </>
          )}

          {saveState === "error" && (
            <>
              <AlertTriangle className="size-3.5 text-destructive" />
              <span className="text-destructive">
                {lastErrorMsg || "Lỗi lưu bài"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  if (editor) void persist(editor.getHTML(), ++saveRequestIdRef.current);
                }}
              >
                Thử lại
              </Button>
            </>
          )}

          {saveState === "conflict" && (
            <>
              <AlertTriangle className="size-3.5 text-amber-500" />
              <span className="text-amber-600 font-medium">
                Xung đột: Bài đọc đã được chỉnh sửa ở thiết bị khác.
              </span>
            </>
          )}

          {saveState === "idle" && !lastSavedAt && (
            <span className="text-muted-foreground">Sẵn sàng chỉnh sửa</span>
          )}
        </div>

        {/* Toolbar Action Buttons */}
        {editor && (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs font-bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </Button>
            <Button
              type="button"
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </Button>

            <div className="mx-1 h-4 w-px bg-border" />

            <Button
              type="button"
              variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs font-semibold"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </Button>
            <Button
              type="button"
              variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs font-semibold"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </Button>

            <div className="mx-1 h-4 w-px bg-border" />

            <Button
              type="button"
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              • Danh sách
            </Button>
            <Button
              type="button"
              variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              Trích dẫn
            </Button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
