import { useRef, useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import QuizBuilder from "@/features/grammar/components/QuizBuilder";
import LessonTheoryEditor from "@/features/grammar/components/LessonTheoryEditor";
import grammarLessonApi from "@/api/grammarLessonApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGrammarLessonDetailController } from "@/features/grammar/hooks/useGrammarLessonDetailController";
import { grammarRoutePaths } from "@/features/grammar/routes/grammarRoutes";

function LessonInfoSkeleton() {
  return <Skeleton className="h-40 w-full rounded-3xl" />;
}

export default function GrammarLessonDetailPage() {
  const { topicSlug, lessonSlug } = useParams<{
    topicSlug: string;
    lessonSlug: string;
  }>();
  const controller = useGrammarLessonDetailController(lessonSlug);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const handleUploadFile = async (file: File) => {
    if (!controller.lesson) return;
    setIsUploading(true);
    try {
      await grammarLessonApi.uploadFromDocument(controller.lesson._id, file);
      toast.success("Upload file thành công!");
      await controller.reloadLesson();
      setEditorKey((k) => k + 1);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || "Upload thất bại";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link
        to={
          topicSlug
            ? grammarRoutePaths.topicDetail(topicSlug)
            : grammarRoutePaths.topics
        }
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại chủ đề
      </Link>

      {controller.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {controller.error}
        </div>
      ) : null}

      {controller.isLoadingLesson && !controller.lesson ? (
        <LessonInfoSkeleton />
      ) : null}

      {controller.lesson ? (
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Grammar Lesson
                </p>
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  {controller.lesson.title}
                </h1>
                {controller.lesson.shortDescription ? (
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    {controller.lesson.shortDescription}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-muted/40 px-5 py-4">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Thứ tự
                </p>
                <p className="font-semibold text-foreground">
                  {controller.lesson.order}
                </p>
              </div>
              <div className="mx-2 h-8 w-px bg-border" />
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Trạng thái
                </p>
                <p className="font-semibold text-foreground">
                  {controller.lesson.isActive ? "Hoạt động" : "Đã ẩn"}
                </p>
              </div>
              <div className="mx-2 h-8 w-px bg-border" />
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Xuất bản
                </p>
                <p className="font-semibold text-foreground">
                  {controller.lesson.isPublished ? "Đã xuất bản" : "Bản nháp"}
                </p>
              </div>
              <div className="mx-2 h-8 w-px bg-border" />
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  XP thưởng
                </p>
                <p className="font-semibold text-foreground">
                  {controller.lesson.xpReward ?? 10} XP
                </p>
              </div>
              <div className="mx-2 h-8 w-px bg-border" />
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Ngưỡng đạt
                </p>
                <p className="font-semibold text-foreground">
                  {controller.lesson.passThreshold ?? 70}%
                </p>
              </div>
              <div className="mx-2 h-8 w-px bg-border" />
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Trắc nghiệm
                </p>
                <Badge variant={controller.lesson.hasQuiz ? "default" : "outline"}>
                  {controller.lesson.hasQuiz ? "Có" : "Chưa có"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {controller.lesson ? (
        <Tabs defaultValue="theory">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="theory">Lý thuyết</TabsTrigger>
              <TabsTrigger value="quiz">
                Trắc nghiệm
                {!controller.lesson.hasQuiz && (
                  <Badge variant="outline" className="ml-1.5 text-[10px]">
                    Chưa có
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="theory">
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Nội dung bài học
                </p>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleUploadFile(file);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-1.5 size-3.5" />
                    {isUploading ? "Đang upload..." : "Upload file DOCX"}
                  </Button>
                </div>
              </div>
              <LessonTheoryEditor
                key={editorKey}
                lessonId={controller.lesson._id}
                initialHtml={controller.lesson.htmlContent}
                initialContentUpdatedAt={controller.lesson.contentUpdatedAt}
              />
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <QuizBuilder
              lessonId={controller.lesson._id}
              onQuizChanged={() => void controller.reloadLesson()}
            />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
