import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Headphones,
  Plus,
  Pencil,
  Trash2,
  Volume2,
  Image as ImageIcon,
  FileText,
  Loader2,
  Save,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import listeningApi, {
  type ListeningSetDetail,
  type ListeningQuestion,
} from "@/api/listeningApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ListeningGroupBuilder from "./components/ListeningGroupBuilder";
import PackageAccessSelector from "@/components/PackageAccessSelector";

export default function ListeningSetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [setDetail, setSetDetail] = useState<ListeningSetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Set Edit state
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [xpReward, setXpReward] = useState(15);
  const [passThreshold, setPassThreshold] = useState(70);
  const [allowedPackageIds, setAllowedPackageIds] = useState<string[]>([]);
  const [isSavingSet, setIsSavingSet] = useState(false);

  // Question Modal for Part 1 & 2
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ListeningQuestion | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioPublicId, setAudioPublicId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [explanation, setExplanation] = useState("");
  const [selectedCorrectKey, setSelectedCorrectKey] = useState("A");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await listeningApi.getSetDetail(id);
      setSetDetail(data);
      setTitle(data.title);
      setStatus(data.status);
      setDifficulty(data.difficulty);
      setXpReward(data.xpReward);
      setPassThreshold(data.passThreshold);
      const rawPackageIds = data.allowedPackageIds || [];
      const stringPackageIds = rawPackageIds
        .map((item: any) => (typeof item === "string" ? item : (item && item._id) || item.id || ""))
        .filter((id: string) => typeof id === "string" && id.length === 24);
      setAllowedPackageIds(stringPackageIds);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tải chi tiết bài nghe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSaveSetInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSavingSet(true);
      await listeningApi.updateSet(id, {
        title,
        status,
        difficulty,
        xpReward: Number(xpReward),
        passThreshold: Number(passThreshold),
        allowedPackageIds,
      });
      toast.success("Cập nhật thông tin bài nghe thành công!");
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin bài nghe");
    } finally {
      setIsSavingSet(false);
    }
  };

  // Upload handlers for Part 1 & 2
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAudio(true);
      const res = await listeningApi.uploadAudio(file);
      setAudioUrl(res.secureUrl);
      setAudioPublicId(res.publicId);
      toast.success("Upload audio thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi upload file audio");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await listeningApi.uploadImage(file);
      setImageUrl(res.secureUrl);
      setImagePublicId(res.publicId);
      toast.success("Upload ảnh thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi upload file ảnh");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenCreateQuestion = () => {
    if (!setDetail) return;
    setEditingQuestion(null);
    setAudioUrl("");
    setAudioPublicId("");
    setImageUrl("");
    setImagePublicId("");
    setTranscript("");
    setExplanation("");
    setSelectedCorrectKey("A");
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: ListeningQuestion) => {
    setEditingQuestion(q);
    setAudioUrl(q.audioUrl || "");
    setAudioPublicId(q.audioPublicId || "");
    setImageUrl(q.imageUrl || "");
    setImagePublicId(q.imagePublicId || "");
    setTranscript(q.transcript || "");
    setExplanation(q.explanation || "");

    const correctOpt = q.options.find((o) => o.isCorrect);
    setSelectedCorrectKey(correctOpt ? correctOpt.key : "A");
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestionPart12 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setDetail) return;

    if (setDetail.part === 1 && !imageUrl) {
      toast.error("Part 1 yêu cầu phải upload 1 file ảnh minh họa");
      return;
    }
    if (!audioUrl) {
      toast.error("Vui lòng upload file âm thanh (audio)");
      return;
    }
    if (!transcript.trim()) {
      toast.error("Vui lòng nhập nội dung transcript bài nghe");
      return;
    }

    const optionKeys = setDetail.part === 1 ? ["A", "B", "C", "D"] : ["A", "B", "C"];
    const options = optionKeys.map((k) => ({
      key: k,
      text: "", // Part 1 & 2 option text is empty per requirements
      isCorrect: k === selectedCorrectKey,
    }));

    try {
      setIsSubmittingQuestion(true);
      if (editingQuestion) {
        await listeningApi.updateQuestion(editingQuestion._id, {
          audioUrl,
          audioPublicId,
          imageUrl,
          imagePublicId,
          transcript,
          options,
          explanation,
        });
        toast.success("Cập nhật câu hỏi thành công!");
      } else {
        await listeningApi.createQuestion({
          setId: setDetail._id,
          part: setDetail.part,
          audioUrl,
          audioPublicId,
          imageUrl,
          imagePublicId,
          transcript,
          options,
          explanation,
        });
        toast.success("Thêm câu hỏi mới thành công!");
      }
      setIsQuestionModalOpen(false);
      fetchDetail();
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
      toast.success("Đã xóa câu hỏi");
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi xóa câu hỏi");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!setDetail) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy bài luyện nghe.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/listening")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header & Back */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/listening">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                TOEIC Part {setDetail.part}
              </span>
              <h1 className="text-xl font-bold text-foreground">{setDetail.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Quản lý chi tiết câu hỏi và tài nguyên bài nghe.
            </p>
          </div>
        </div>
      </div>

      {/* Form Settings Bài Nghe */}
      <form onSubmit={handleSaveSetInfo} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Headphones className="size-4 text-primary" />
          Cấu hình thông tin bài nghe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-foreground">Tiêu đề bài nghe</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 text-xs" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Trạng thái xuất bản</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="draft">Draft (Bản nháp)</option>
              <option value="published">Published (Đã xuất bản)</option>
              <option value="archived">Archived (Lưu trữ)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Độ khó</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <PackageAccessSelector
          value={allowedPackageIds}
          onChange={setAllowedPackageIds}
        />

        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" disabled={isSavingSet} className="gap-2 text-xs">
            {isSavingSet ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Lưu cài đặt
          </Button>
        </div>
      </form>

      {/* Part 3 & 4 Component */}
      {setDetail.part === 3 || setDetail.part === 4 ? (
        <ListeningGroupBuilder
          setId={setDetail._id}
          part={setDetail.part}
          groups={setDetail.groups}
          questions={setDetail.questions}
          onRefresh={fetchDetail}
        />
      ) : (
        /* Part 1 & 2 Question Builder */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Danh sách câu hỏi Part {setDetail.part} ({setDetail.questions.length} câu)
              </h3>
              <p className="text-xs text-muted-foreground">
                {setDetail.part === 1
                  ? "Part 1 bao gồm 1 Ảnh + 1 Audio + Transcript + Chọn đáp án đúng A/B/C/D."
                  : "Part 2 bao gồm 1 Audio + Transcript + Chọn đáp án đúng A/B/C."}
              </p>
            </div>
            <Button onClick={handleOpenCreateQuestion} className="gap-2">
              <Plus className="size-4" />
              Thêm câu hỏi Part {setDetail.part}
            </Button>
          </div>

          {setDetail.questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
              <Volume2 className="mx-auto size-12 text-muted-foreground/50" />
              <h4 className="mt-4 font-semibold text-foreground">Chưa có câu hỏi nào</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Bấm "Thêm câu hỏi Part {setDetail.part}" để bắt đầu tải lên media và đáp án.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {setDetail.questions.map((q, idx) => {
                const correctOpt = q.options.find((o) => o.isCorrect);

                return (
                  <div
                    key={q._id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <span className="font-bold text-sm text-primary">Câu {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditQuestion(q)}>
                            <Pencil className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q._id)}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Part 1 Image Preview */}
                      {setDetail.part === 1 && q.imageUrl && (
                        <div className="relative h-44 w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <img src={q.imageUrl} alt="Part 1" className="h-full w-full object-contain" />
                        </div>
                      )}

                      {/* Audio Player Preview */}
                      {q.audioUrl && (
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
                          <audio src={q.audioUrl} controls className="w-full h-8" />
                        </div>
                      )}

                      {/* Options Radio Preview */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-muted-foreground">Đáp án đúng:</span>
                        <div className="flex gap-2">
                          {q.options.map((opt) => (
                            <span
                              key={opt.key}
                              className={`flex size-7 items-center justify-center rounded-md text-xs font-bold ${
                                opt.isCorrect
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {opt.key}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Transcript */}
                      {q.transcript && (
                        <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-foreground/80">
                          <div className="font-semibold text-muted-foreground mb-1">Transcript:</div>
                          <p className="whitespace-pre-wrap italic">{q.transcript}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-border/40">
                          💡 <strong>Giải thích:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Question Form Part 1 & 2 */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              {editingQuestion
                ? `Chỉnh sửa câu hỏi Part ${setDetail.part}`
                : `Thêm câu hỏi Part ${setDetail.part} mới`}
            </h3>

            <form onSubmit={handleSaveQuestionPart12} className="space-y-4">
              {/* Part 1 Upload Image */}
              {setDetail.part === 1 && (
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Ảnh mô tả (Bắt buộc cho Part 1)
                  </label>
                  <div className="mt-1">
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingImage}
                      onClick={() => document.getElementById("image-upload-input")?.click()}
                      className="w-full flex items-center justify-center gap-2 border-dashed border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 py-5 transition-colors"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="size-5 animate-spin text-primary" />
                      ) : (
                        <Upload className="size-5 text-primary" />
                      )}
                      <span className="text-xs font-semibold text-foreground">
                        {isUploadingImage
                          ? "Đang tải ảnh lên..."
                          : imageUrl
                          ? "Thay đổi ảnh minh họa"
                          : "Tải lên hình ảnh mô tả"}
                      </span>
                    </Button>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 h-36 overflow-hidden rounded-lg border border-border bg-muted">
                      <img src={imageUrl} alt="Preview" className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>
              )}

              {/* Upload Audio */}
              <div>
                <label className="text-xs font-semibold text-foreground">File âm thanh</label>
                <div className="mt-1">
                  <input
                    id="audio-upload-input"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={isUploadingAudio}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploadingAudio}
                    onClick={() => document.getElementById("audio-upload-input")?.click()}
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
                        : audioUrl
                        ? "Thay đổi file âm thanh"
                        : "Tải lên file audio"}
                    </span>
                  </Button>
                </div>
                {audioUrl && (
                  <div className="mt-2">
                    <audio src={audioUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              {/* Select Correct Choice */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Chọn đáp án đúng:
                </label>
                <div className="flex gap-4">
                  {(setDetail.part === 1 ? ["A", "B", "C", "D"] : ["A", "B", "C"]).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="radio"
                        name="part12CorrectKey"
                        value={key}
                        checked={selectedCorrectKey === key}
                        onChange={() => setSelectedCorrectKey(key)}
                        className="size-4 text-primary focus:ring-primary"
                      />
                      Đáp án {key}
                    </label>
                  ))}
                </div>
              </div>

              {/* Transcript */}
              <div>
                <label className="text-xs font-semibold text-foreground">Transcript bài nghe</label>
                <Textarea
                  rows={4}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    setDetail.part === 1
                      ? "(A) They're looking at a map.\n(B) They're sitting in a park.\n(C) They're entering a building.\n(D) They're packing up their belongings."
                      : "(A) Yes, it is.\n(B) On the third floor.\n(C) Tomorrow morning."
                  }
                  className="mt-1 text-xs font-mono"
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="text-xs font-semibold text-foreground">Giải thích / Từ vựng bổ sung</label>
                <Textarea
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Nhập phần giải thích cho học viên xem lại sau khi nộp bài..."
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsQuestionModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmittingQuestion || isUploadingAudio || isUploadingImage}>
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
