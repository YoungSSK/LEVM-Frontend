import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Volume2,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import listeningApi, {
  type ListeningAudioGroup,
  type ListeningQuestion,
} from "@/api/listeningApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ListeningGroupBuilderProps {
  setId: string;
  part: 3 | 4;
  groups: ListeningAudioGroup[];
  questions: ListeningQuestion[];
  onRefresh: () => void;
}

export default function ListeningGroupBuilder({
  setId,
  part,
  groups,
  questions,
  onRefresh,
}: ListeningGroupBuilderProps) {
  // State for Group Form
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ListeningAudioGroup | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupAudioUrl, setGroupAudioUrl] = useState("");
  const [groupAudioPublicId, setGroupAudioPublicId] = useState("");
  const [groupTranscript, setGroupTranscript] = useState("");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // State for Question Form inside Group
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ListeningQuestion | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<
    { key: string; text: string; isCorrect: boolean }[]
  >([
    { key: "A", text: "", isCorrect: true },
    { key: "B", text: "", isCorrect: false },
    { key: "C", text: "", isCorrect: false },
    { key: "D", text: "", isCorrect: false },
  ]);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Handlers for Audio Group
  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupTitle("");
    setGroupAudioUrl("");
    setGroupAudioPublicId("");
    setGroupTranscript("");
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: ListeningAudioGroup) => {
    setEditingGroup(group);
    setGroupTitle(group.title || "");
    setGroupAudioUrl(group.audioUrl);
    setGroupAudioPublicId(group.audioPublicId || "");
    setGroupTranscript(group.transcript);
    setIsGroupModalOpen(true);
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAudio(true);
      const res = await listeningApi.uploadAudio(file);
      setGroupAudioUrl(res.secureUrl);
      setGroupAudioPublicId(res.publicId);
      toast.success("Upload audio nhóm thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi upload file audio");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupAudioUrl) {
      toast.error("Vui lòng upload file âm thanh (audio)");
      return;
    }
    if (!groupTranscript.trim()) {
      toast.error("Vui lòng nhập nội dung transcript");
      return;
    }

    try {
      setIsSubmittingGroup(true);
      if (editingGroup) {
        await listeningApi.updateGroup(editingGroup._id, {
          title: groupTitle,
          audioUrl: groupAudioUrl,
          audioPublicId: groupAudioPublicId,
          transcript: groupTranscript,
        });
        toast.success("Cập nhật Audio Group thành công!");
      } else {
        await listeningApi.createGroup(setId, {
          title: groupTitle,
          audioUrl: groupAudioUrl,
          audioPublicId: groupAudioPublicId,
          transcript: groupTranscript,
        });
        toast.success("Tạo Audio Group mới thành công!");
      }
      setIsGroupModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi lưu Audio Group");
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa Audio Group này và toàn bộ câu hỏi con thuộc nhóm?")) return;
    try {
      await listeningApi.deleteGroup(groupId);
      toast.success("Đã xóa Audio Group");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi xóa Audio Group");
    }
  };

  // Handlers for Question inside Group
  const handleOpenCreateQuestion = (groupId: string) => {
    setTargetGroupId(groupId);
    setEditingQuestion(null);
    setQuestionText("");
    setExplanation("");
    setOptions([
      { key: "A", text: "", isCorrect: true },
      { key: "B", text: "", isCorrect: false },
      { key: "C", text: "", isCorrect: false },
      { key: "D", text: "", isCorrect: false },
    ]);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: ListeningQuestion) => {
    setTargetGroupId(q.groupId || null);
    setEditingQuestion(q);
    setQuestionText(q.questionText || "");
    setExplanation(q.explanation || "");
    setOptions(
      q.options.length > 0
        ? q.options.map((o) => ({ key: o.key, text: o.text, isCorrect: o.isCorrect }))
        : [
            { key: "A", text: "", isCorrect: true },
            { key: "B", text: "", isCorrect: false },
            { key: "C", text: "", isCorrect: false },
            { key: "D", text: "", isCorrect: false },
          ]
    );
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    for (const opt of options) {
      if (!opt.text.trim()) {
        toast.error(`Đáp án ${opt.key} không được để trống đối với Part 3 & 4`);
        return;
      }
    }
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      toast.error("Vui lòng chọn duy nhất 1 đáp án đúng");
      return;
    }

    try {
      setIsSubmittingQuestion(true);
      if (editingQuestion) {
        await listeningApi.updateQuestion(editingQuestion._id, {
          questionText,
          options,
          explanation,
        });
        toast.success("Cập nhật câu hỏi thành công!");
      } else {
        if (!targetGroupId) return;
        await listeningApi.createQuestion({
          setId,
          groupId: targetGroupId,
          part,
          questionText,
          options,
          explanation,
        });
        toast.success("Thêm câu hỏi mới thành công!");
      }
      setIsQuestionModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi lưu câu hỏi");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await listeningApi.deleteQuestion(qId);
      toast.success("Xóa câu hỏi thành công!");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi xóa câu hỏi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Danh sách nhóm bài nghe (Part {part})
          </h3>
          <p className="text-sm text-muted-foreground">
            Mỗi nhóm gồm 1 đoạn audio + transcript dùng chung cho khoảng 3 câu hỏi.
          </p>
        </div>
        <Button onClick={handleOpenCreateGroup} className="gap-2">
          <Plus className="size-4" />
          Tạo Audio Group mới
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Volume2 className="mx-auto size-12 text-muted-foreground/50" />
          <h4 className="mt-4 font-semibold text-foreground">Chưa có Audio Group nào</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Bấm nút "Tạo Audio Group mới" ở trên để tải lên audio và transcript bài nghe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, groupIdx) => {
            const groupQuestions = questions.filter(
              (q) => String(q.groupId) === String(group._id)
            );
            const isExceedingCount = groupQuestions.length > 3;

            return (
              <div
                key={group._id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/20"
              >
                {/* Header Group */}
                <div className="border-b border-border bg-muted/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        #{groupIdx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {group.title || `Audio Group #${groupIdx + 1}`}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {groupQuestions.length} câu hỏi con
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCreateQuestion(group._id)}
                        className="gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        Thêm câu hỏi con
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditGroup(group)}
                      >
                        <Pencil className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGroup(group._id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Audio Player & Transcript */}
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-background p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Volume2 className="size-3.5 text-primary" />
                        File âm thanh bài nghe:
                      </div>
                      <audio src={group.audioUrl} controls className="w-full h-10 rounded" />
                    </div>

                    <div className="rounded-lg border border-border/60 bg-background p-3">
                      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <FileText className="size-3.5 text-primary" />
                        Transcript hội thoại:
                      </div>
                      <p className="line-clamp-3 text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                        {group.transcript}
                      </p>
                    </div>
                  </div>

                  {/* Warning banner if count > 3 */}
                  {isExceedingCount && (
                    <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>
                        ⚠️ Nhóm này đang có <strong>{groupQuestions.length} câu hỏi</strong>.
                        Khuyến nghị chuẩn bài thi TOEIC Part {part} là <strong>3 câu hỏi/nhóm</strong>.
                      </span>
                    </div>
                  )}
                </div>

                {/* Question List inside Group */}
                <div className="divide-y divide-border p-4">
                  {groupQuestions.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Chưa có câu hỏi nào trong nhóm này. Hãy bấm "Thêm câu hỏi con" để tạo.
                    </p>
                  ) : (
                    groupQuestions.map((q, qIdx) => (
                      <div key={q._id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              <span className="mr-2 text-primary">Q{qIdx + 1}.</span>
                              {q.questionText}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.key}
                                  className={`flex items-center gap-2 rounded-md border p-2 text-xs transition-colors ${
                                    opt.isCorrect
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium"
                                      : "border-border/60 bg-muted/20 text-muted-foreground"
                                  }`}
                                >
                                  <span className="font-bold">{opt.key}.</span>
                                  <span className="flex-1">{opt.text}</span>
                                  {opt.isCorrect && (
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>

                            {q.explanation && (
                              <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/40">
                                💡 <strong>Giải thích:</strong> {q.explanation}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditQuestion(q)}
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(q._id)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Group Form */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              {editingGroup ? "Chỉnh sửa Audio Group" : "Tạo Audio Group mới"}
            </h3>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Tiêu đề nhóm (Optional)</label>
                <Input
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="Ví dụ: Conversation 1 - Questions 32-34"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">File âm thanh</label>
                <div className="mt-1">
                  <input
                    id="group-audio-upload-input"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    disabled={isUploadingAudio}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploadingAudio}
                    onClick={() => document.getElementById("group-audio-upload-input")?.click()}
                    className="w-full flex items-center justify-center gap-2 border-dashed border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 py-5 transition-colors"
                  >
                    {isUploadingAudio ? (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                      <Upload className="size-5 text-primary" />
                    )}
                    <span className="text-xs font-semibold text-foreground">
                      {isUploadingAudio
                        ? "Đang tải audio lên..."
                        : groupAudioUrl
                        ? "Thay đổi file âm thanh nhóm"
                        : "Tải lên file audio"}
                    </span>
                  </Button>
                </div>
                {groupAudioUrl && (
                  <div className="mt-2">
                    <audio src={groupAudioUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nội dung Transcript (Dùng chung cho nhóm)</label>
                <Textarea
                  rows={5}
                  value={groupTranscript}
                  onChange={(e) => setGroupTranscript(e.target.value)}
                  placeholder="Nhập nội dung hội thoại / bài phát biểu tiếng Anh..."
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsGroupModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmittingGroup || isUploadingAudio}>
                  {isSubmittingGroup && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Lưu Group
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Question Form */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới vào nhóm"}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Nội dung câu hỏi (Question Text)</label>
                <Textarea
                  rows={2}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ví dụ: What does the woman imply when she says...?"
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Các lựa chọn đáp án (Chọn 1 đáp án đúng):
                </label>
                {options.map((opt, idx) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-sm text-center">{opt.key}.</span>
                    <Input
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx].text = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Nội dung đáp án ${opt.key}`}
                      className="flex-1"
                    />
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={opt.isCorrect}
                        onChange={() => {
                          setOptions(
                            options.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            }))
                          );
                        }}
                        className="size-4 text-primary focus:ring-primary"
                      />
                      Đúng
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Giải thích đáp án (Explanation)</label>
                <Textarea
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Nhập giải thích từ vựng hoặc lý do đáp án đúng..."
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsQuestionModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmittingQuestion}>
                  {isSubmittingQuestion && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Lưu câu hỏi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
