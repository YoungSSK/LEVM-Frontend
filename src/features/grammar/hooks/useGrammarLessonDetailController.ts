/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import grammarLessonApi from "@/api/grammarLessonApi";
import type { GrammarLessonDetail } from "@/api/grammarLessonApi";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Lỗi hệ thống, vui lòng thử lại sau.";
}

export function useGrammarLessonDetailController(lessonSlug?: string) {
  const [lesson, setLesson] = useState<GrammarLessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  const requestRef = useRef(0);

  const loadLesson = useCallback(async (nextLessonSlug?: string) => {
    const currentSlug = nextLessonSlug ?? lessonSlug;

    if (!currentSlug) {
      setLesson(null);
      setError("Thiếu lessonSlug.");
      return;
    }

    const requestId = ++requestRef.current;
    setIsLoadingLesson(true);

    try {
      const data = await grammarLessonApi.getBySlug(currentSlug);

      if (requestId !== requestRef.current) return;

      setLesson(data);
      setError(null);
    } catch (loadError) {
      if (requestId !== requestRef.current) return;

      const message = getErrorMessage(loadError);
      setLesson(null);
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestRef.current) {
        setIsLoadingLesson(false);
      }
    }
  }, [lessonSlug]);

  useEffect(() => {
    setError(null);
    void loadLesson();
  }, [loadLesson]);

  const reloadLesson = useCallback(async () => {
    if (lessonSlug) {
      await loadLesson(lessonSlug);
    }
  }, [loadLesson, lessonSlug]);

  return {
    lesson,
    error,
    isLoadingLesson,
    reloadLesson,
  };
}
