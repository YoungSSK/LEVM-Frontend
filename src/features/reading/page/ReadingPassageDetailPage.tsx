import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Copy, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import readingPassageApi from "@/api/readingPassageApi";
import type { ReadingPassageDetail } from "@/api/readingPassageApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ConfirmDeleteDialog from "@/features/vocabulary/components/ConfirmDeleteDialog";

import ReadingContentEditor from "../components/ReadingContentEditor";
import ReadingQuestionBuilder from "../components/ReadingQuestionBuilder";
import ReadingDocxUploadButton from "../components/ReadingDocxUploadButton";
import ReadingPassageStatusBadge from "../components/ReadingPassageStatusBadge";
import ReadingPassageFormDialog from "../components/ReadingPassageFormDialog";
import { readingRoutePaths } from "../routes/readingRoutes";

export default function ReadingPassageDetailPage() {
  const { passageSlug } = useParams<{ passageSlug: string }>();
  const navigate = useNavigate();

  const [passage, setPassage] = useState<ReadingPassageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadPassage = useCallback(async () => {
    if (!passageSlug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await readingPassageApi.getBySlug(passageSlug);
      setPassage(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Lỗi tải thông tin bài đọc";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [passageSlug]);

  useEffect(() => {
    void loadPassage();
  }, [loadPassage]);

  const handleClone = async () => {
    if (!passage) return;
    try {
      const cloned = await readingPassageApi.clone(passage._id);
      toast.success("Clone bài đọc thành công! Đang chuyển trang...");
      navigate(readingRoutePaths.passageDetail(cloned.slug));
    } catch (err) {
      toast.error("Lỗi sao chép bài đọc");
    }
  };

  const handleDelete = async () => {
    if (!passage) return;
    try {
      await readingPassageApi.delete(passage._id);
      toast.success("Đã xóa bài đọc.");
      const catSlug =
        typeof passage.categoryId === "object" ? passage.categoryId.slug : "";
      navigate(
        catSlug
          ? readingRoutePaths.categoryDetail(catSlug)
          : readingRoutePaths.categories,
      );
    } catch (err) {
      toast.error("Lỗi xóa bài đọc");
    }
  };

  const categoryName =
    typeof passage?.categoryId === "object"
      ? passage.categoryId.name
      : "Danh mục";
  const categorySlug =
    typeof passage?.categoryId === "object"
      ? passage.categoryId.slug
      : undefined;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to={
          categorySlug
            ? readingRoutePaths.categoryDetail(categorySlug)
            : readingRoutePaths.categories
        }
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại {categoryName}
      </Link>

      {/* Error Message */}
      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading && !passage ? (
        <Skeleton className="h-44 w-full rounded-3xl" />
      ) : null}

      {/* Header Info Card */}
      {passage ? (
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Reading Passage
                  </span>
                  <ReadingPassageStatusBadge status={passage.status} />
                </div>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  {passage.title}
                </h1>
                {passage.description ? (
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {passage.description}
                  </p>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="mr-1.5 size-3.5" />
                  Sửa metadata
                </Button>
                <Button variant="outline" size="sm" onClick={handleClone}>
                  <Copy className="mr-1.5 size-3.5" />
                  Sao chép
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  Xóa
                </Button>
              </div>
            </div>

            {/* Passage Meta Bar */}
            <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-muted/40 px-5 py-3 text-xs">
              <div>
                <span className="text-muted-foreground">Độ khó:</span>{" "}
                <span className="font-semibold text-foreground capitalize">
                  {passage.difficulty}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">CEFR:</span>{" "}
                <span className="font-semibold text-foreground">
                  {passage.cefrLevel || "B1"}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">Dạng bài:</span>{" "}
                <span className="font-semibold text-foreground capitalize">
                  {passage.readingType}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">Số từ:</span>{" "}
                <span className="font-semibold text-foreground">
                  {passage.wordCount || 0} từ
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">Thời gian:</span>{" "}
                <span className="font-semibold text-foreground">
                  {passage.estimatedTime || 0} phút
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">Thưởng:</span>{" "}
                <span className="font-semibold text-emerald-600">
                  {passage.xpReward || 15} XP
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-muted-foreground">Trắc nghiệm:</span>{" "}
                <Badge variant={passage.hasQuestions ? "default" : "outline"} className="ml-1 text-[10px]">
                  {passage.hasQuestions ? "Có" : "Chưa có"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Main Tabs (Nội dung / Câu hỏi) */}
      {passage ? (
        <Tabs defaultValue="content">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="content">Nội dung bài đọc</TabsTrigger>
              <TabsTrigger value="questions">
                Bộ câu hỏi
                {!passage.hasQuestions && (
                  <Badge variant="outline" className="ml-1.5 text-[10px]">
                    Chưa có
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Passage Content Editor */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Soạn thảo & Quản lý văn bản bài đọc
              </p>

              <ReadingDocxUploadButton
                passageId={passage._id}
                onUploadSuccess={async () => {
                  await loadPassage();
                  setEditorKey((k) => k + 1);
                }}
              />
            </div>

            <ReadingContentEditor
              key={editorKey}
              passageId={passage._id}
              initialHtml={passage.htmlContent}
              initialContentUpdatedAt={passage.contentUpdatedAt}
            />
          </TabsContent>

          {/* Tab 2: Question Builder */}
          <TabsContent value="questions" className="mt-4">
            <ReadingQuestionBuilder
              passageId={passage._id}
              onQuestionsChanged={() => void loadPassage()}
            />
          </TabsContent>
        </Tabs>
      ) : null}

      {/* Edit Metadata Form Dialog */}
      {isEditDialogOpen && passage && (
        <ReadingPassageFormDialog
          open={isEditDialogOpen}
          mode="edit"
          categories={[]}
          passage={passage}
          isSubmitting={false}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={async (payload) => {
            await readingPassageApi.update(passage._id, payload);
            toast.success("Đã cập nhật metadata bài đọc.");
            setIsEditDialogOpen(false);
            await loadPassage();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title="Xóa bài đọc?"
        description={
          passage ? (
            <>
              Bài đọc <strong>{passage.title}</strong> sẽ bị xóa vĩnh viễn cùng toàn bộ bộ câu hỏi và dữ liệu làm bài.
            </>
          ) : null
        }
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
