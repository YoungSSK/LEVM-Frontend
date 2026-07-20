/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import grammarTopicApi from "@/api/grammarTopicApi";
import grammarLessonApi from "@/api/grammarLessonApi";
import type { GrammarTopicDetail } from "@/api/grammarTopicApi";
import type { LessonType, GrammarLesson } from "@/api/grammarLessonApi";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Lỗi hệ thống, vui lòng thử lại sau.";
}

function sortByOrderThenLabel<T extends { order?: number; title?: string }>(
  items: T[],
) {
  return [...items].sort((a, b) => {
    const orderDelta =
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER);

    if (orderDelta !== 0) {
      return orderDelta;
    }

    const labelA = a.title ?? "";
    const labelB = b.title ?? "";
    return labelA.localeCompare(labelB);
  });
}

type LessonEditorState =
  | { mode: "create" }
  | { mode: "edit"; lesson: GrammarLesson };

export function useGrammarTopicDetailController(topicSlug?: string) {
  const [topic, setTopic] = useState<GrammarTopicDetail | null>(null);
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [lessonEditor, setLessonEditor] = useState<LessonEditorState | null>(
    null,
  );

  const topicRequestRef = useRef(0);

  const loadTopic = useCallback(async (nextTopicSlug?: string) => {
    const currentTopicSlug = nextTopicSlug ?? topicSlug;

    if (!currentTopicSlug) {
      setTopic(null);
      setError("Thiếu topicSlug.");
      return;
    }

    const requestId = ++topicRequestRef.current;
    setIsLoadingTopic(true);

    try {
      const nextTopic = await grammarTopicApi.getBySlug(currentTopicSlug);

      if (requestId !== topicRequestRef.current) return;

      setTopic(nextTopic);
    } catch (loadError) {
      if (requestId !== topicRequestRef.current) return;

      const message = getErrorMessage(loadError);
      setTopic(null);
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === topicRequestRef.current) {
        setIsLoadingTopic(false);
      }
    }
  }, [topicSlug]);

  const loadLessons = useCallback(async () => {
    if (!topic) return;

    setIsLoadingLessons(true);

    try {
      const result = await grammarLessonApi.getAll(1, 100, topic._id);
      setLessons(result.lessons);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError));
    } finally {
      setIsLoadingLessons(false);
    }
  }, [topic]);

  useEffect(() => {
    setError(null);
    void loadTopic();
  }, [loadTopic]);

  useEffect(() => {
    if (topic) {
      void loadLessons();
    }
  }, [loadLessons, topic]);

  const openCreateLesson = () => {
    if (!topic) {
      toast.info("Hãy chờ topic tải xong trước.");
      return;
    }

    setLessonEditor({ mode: "create" });
  };

  const openEditLesson = (lesson: GrammarLesson) => {
    setLessonEditor({ mode: "edit", lesson });
  };

  const closeLessonEditor = () => {
    setLessonEditor(null);
  };

  const saveLesson = async (payload: {
    topicId: string;
    title: string;
    shortDescription?: string;
    htmlContent?: string;
    thumbnailUrl?: string;
    estimatedTime?: number;
    lessonType?: LessonType;
    parentLessonId?: string | null;
  }) => {
    if (!topic) {
      toast.info("Topic chưa sẵn sàng.");
      return;
    }

    try {
      if (lessonEditor?.mode === "edit") {
        await grammarLessonApi.update(lessonEditor.lesson._id, payload);
        toast.success("Đã cập nhật bài học.");
      } else {
        await grammarLessonApi.create(payload);
        toast.success("Đã tạo bài học mới.");
      }

      closeLessonEditor();
      await loadLessons();
      await loadTopic(topic.slug);
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  };

  const deleteLesson = async (lesson: GrammarLesson) => {
    try {
      await grammarLessonApi.delete(lesson._id);
      toast.success("Đã xóa bài học.");

      if (
        lessonEditor?.mode === "edit" &&
        lessonEditor.lesson._id === lesson._id
      ) {
        closeLessonEditor();
      }

      if (topic) {
        await loadLessons();
        await loadTopic(topic.slug);
      }
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  const toggleLessonStatus = async (lesson: GrammarLesson) => {
    try {
      await grammarLessonApi.changeStatus(lesson._id);
      toast.success(
        lesson.isActive ? "Đã ẩn bài học." : "Đã hiển thị bài học.",
      );

      if (topic) {
        await loadLessons();
        await loadTopic(topic.slug);
      }
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError));
    }
  };

  const togglePublishStatus = async (lesson: GrammarLesson) => {
    try {
      await grammarLessonApi.changePublishStatus(lesson._id);
      toast.success(
        lesson.isPublished
          ? "Đã gỡ xuất bản bài học."
          : "Đã xuất bản bài học.",
      );

      if (topic) {
        await loadLessons();
        await loadTopic(topic.slug);
      }
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError));
    }
  };

  const theoryLessons = lessons.filter(
    (l) => l.lessonType === "theory" || !l.lessonType,
  );

  return {
    topic,
    lessons: sortByOrderThenLabel(lessons),
    theoryLessons: sortByOrderThenLabel(theoryLessons),
    error,
    isLoadingTopic,
    isLoadingLessons,
    lessonEditor,
    openCreateLesson,
    openEditLesson,
    closeLessonEditor,
    saveLesson,
    deleteLesson,
    toggleLessonStatus,
    togglePublishStatus,
  };
}
