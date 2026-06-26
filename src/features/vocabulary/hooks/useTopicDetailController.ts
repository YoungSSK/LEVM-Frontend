/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import vocabularyTopicApi from "@/api/vocabularyTopicApi";
import { useVocabularyLessonStore } from "@/stores/VocabularyLessonStore";
import type {
  CreateVocabularyLessonPayload,
  UpdateVocabularyLessonPayload,
  VocabularyLesson,
  VocabularyTopic,
} from "@/features/vocabulary/types";

import { getErrorMessage, sortByOrderThenLabel } from "@/features/vocabulary/hooks/vocabularyHookUtils";

type LessonEditorState =
  | { mode: "create" }
  | { mode: "edit"; lesson: VocabularyLesson };

export function useTopicDetailController(topicId?: string) {
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [lessonEditor, setLessonEditor] = useState<LessonEditorState | null>(
    null,
  );

  const {
    lessons,
    isLoading: isLoadingLessons,
    error: lessonsError,
    fetchByTopic,
    create: createLesson,
    update: updateLesson,
    changeStatus,
    remove: removeLesson,
  } = useVocabularyLessonStore();

  const topicRequestRef = useRef(0);

  const loadTopic = async (nextTopicId?: string) => {
    const currentTopicId = nextTopicId ?? topicId;

    if (!currentTopicId) {
      setTopic(null);
      setError("Thiếu topicId.");
      return;
    }

    const requestId = ++topicRequestRef.current;
    setIsLoadingTopic(true);

    try {
      const nextTopic = await vocabularyTopicApi.getById(currentTopicId);

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
  };

  const loadLessons = async (nextTopicId?: string) => {
    const currentTopicId = nextTopicId ?? topicId;

    if (!currentTopicId) {
      return;
    }

    try {
      await fetchByTopic(currentTopicId);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError));
    }
  };

  useEffect(() => {
    setError(null);
    void loadTopic();
    void loadLessons();
  }, [topicId]);

  const openCreateLesson = () => {
    if (!topic) {
      toast.info("Hãy chờ topic tải xong trước.");
      return;
    }

    setLessonEditor({ mode: "create" });
  };

  const openEditLesson = (lesson: VocabularyLesson) => {
    setLessonEditor({ mode: "edit", lesson });
  };

  const closeLessonEditor = () => {
    setLessonEditor(null);
  };

  const saveLesson = async (
    payload: CreateVocabularyLessonPayload | UpdateVocabularyLessonPayload,
  ) => {
    if (!topic) {
      toast.info("Topic chưa sẵn sàng.");
      return;
    }

    const rawPayload = payload as any;
    const cleanPayload = {
      title: rawPayload.title ?? "",
      description: rawPayload.description,
      thumbnail: rawPayload.thumbnail,
      estimatedTime: rawPayload.estimatedTime ? Number(rawPayload.estimatedTime) : undefined,
    };

    try {
      if (lessonEditor?.mode === "edit") {
        await updateLesson(lessonEditor.lesson._id, cleanPayload);
        
        if (
          rawPayload.isPublished !== undefined &&
          rawPayload.isPublished !== lessonEditor.lesson.isPublished
        ) {
          await changeStatus(lessonEditor.lesson._id);
        }
        
        toast.success("Đã cập nhật lesson.");
      } else {
        await createLesson(topic._id, cleanPayload);
        toast.success("Đã tạo lesson mới.");
      }

      closeLessonEditor();
      await Promise.all([loadTopic(topic._id), loadLessons(topic._id)]);
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  };

  const deleteLesson = async (lesson: VocabularyLesson) => {
    try {
      await removeLesson(lesson._id);
      toast.success("Đã xóa lesson.");

      if (lessonEditor?.mode === "edit" && lessonEditor.lesson._id === lesson._id) {
        closeLessonEditor();
      }

      if (topic) {
        await Promise.all([loadTopic(topic._id), loadLessons(topic._id)]);
      }
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  return {
    topic,
    lessons: sortByOrderThenLabel(lessons),
    error: error || lessonsError,
    isLoadingTopic,
    isLoadingLessons,
    isSavingLesson: false,
    lessonEditor,
    openCreateLesson,
    openEditLesson,
    closeLessonEditor,
    saveLesson,
    deleteLesson,
  };
}

