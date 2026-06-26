import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useVocabularyLessonStore } from "@/stores/VocabularyLessonStore";
import vocabularyTopicApi from "@/api/vocabularyTopicApi";
import wordApi from "@/api/wordApi";
import wordMeaningApi from "@/api/wordMeaningApi";
import type { LessonWord } from "@/api/vocabularyLessonApi";
import type {
  AddWordToLessonPayload,
  VocabularyLessonWordRelation,
  VocabularyTopic,
  VocabularyWord,
} from "@/features/vocabulary/types";

import {
  getErrorMessage,
  sortLessonRelations,
  sortWordsByLabel,
} from "@/features/vocabulary/hooks/vocabularyHookUtils";

export function useLessonDetailController(lessonId?: string) {
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [availableWords, setAvailableWords] = useState<VocabularyWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  const {
    selectedLesson: lesson,
    words: lessonWordsRaw,
    isLoading: isLoadingLesson,
    error: lessonStoreError,
    fetchById: fetchLessonById,
    fetchWords: fetchLessonWords,
    addWord,
    removeWord,
  } = useVocabularyLessonStore();

  const topicRequestRef = useRef(0);
  const wordsRequestRef = useRef(0);

  const loadLessonData = useCallback(async () => {
    if (!lessonId) return;
    try {
      await fetchLessonById(lessonId);
      await fetchLessonWords(lessonId);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError));
    }
  }, [lessonId, fetchLessonById, fetchLessonWords]);

  const loadTopic = useCallback(async (topicId?: string) => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    const requestId = ++topicRequestRef.current;

    try {
      const nextTopic = await vocabularyTopicApi.getById(topicId);

      if (requestId !== topicRequestRef.current) return;

      setTopic(nextTopic);
    } catch (loadError) {
      if (requestId !== topicRequestRef.current) return;

      const message = getErrorMessage(loadError);
      setTopic(null);
      setError(message);
      toast.error(message);
    }
  }, []);

  const loadAvailableWords = useCallback(async () => {
     setIsLoadingWords(true);
    const requestId = ++wordsRequestRef.current;

    try {
      const res = await wordApi.getAll(1, 100);
      const nextWords = sortWordsByLabel(res.words).map(
        (word) => ({
          ...word,
          meaningPreview:
            word.meanings?.[0]?.meaning ?? undefined,
          meaningCount: word.meanings?.length ?? 0,
        }),
      );

      if (requestId !== wordsRequestRef.current) return;

      setAvailableWords(nextWords);
    } catch (loadError) {
      if (requestId !== wordsRequestRef.current) return;

      const message = getErrorMessage(loadError);
      setAvailableWords([]);
      setError(message);
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
      void loadLessonData();
      void loadAvailableWords();
    }, 0);
    return () => clearTimeout(timer);
  }, [lessonId, loadLessonData, loadAvailableWords]);

  useEffect(() => {
    if (!lesson?.topicId) return;

    const timer = setTimeout(() => {
      void loadTopic(lesson.topicId);
    }, 0);
    return () => clearTimeout(timer);
  }, [lesson?.topicId, loadTopic]);

  const openAddWordModal = () => {
    if (!lesson) {
      toast.info("Lesson chưa sẵn sàng.");
      return;
    }

    setIsAddWordModalOpen(true);
  };

  const closeAddWordModal = () => {
    setIsAddWordModalOpen(false);
  };

  const addWordToLesson = async (payload: AddWordToLessonPayload) => {
    if (!lesson) return;

    try {
      await addWord(lesson._id, {
        wordId: payload.wordId,
        wordMeaningId: payload.meaningId,
      });
      toast.success("Đã thêm word vào lesson.");
      closeAddWordModal();

      await loadLessonData();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  };

  const removeWordFromLesson = async (
    relation: VocabularyLessonWordRelation,
  ) => {
    if (!lesson) {
      return;
    }

    if (!relation.wordId) {
      toast.error("Không thể xóa relation này.");
      return;
    }

    try {
      await removeWord(lesson._id, relation.wordId);
      toast.success("Đã xóa word khỏi lesson.");

      await loadLessonData();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  const lessonWords: VocabularyLessonWordRelation[] = lessonWordsRaw.map((w: LessonWord) => {
    const wordObj = typeof w.wordId === "object" ? w.wordId : null;
    const meaningObj = typeof w.wordMeaningId === "object" ? w.wordMeaningId : null;

    return {
      _id: w._id,
      lessonId: w.lessonId,
      wordId: wordObj ? wordObj._id : (w.wordId as string),
      meaningId: meaningObj ? meaningObj._id : (w.wordMeaningId as string),
      word: wordObj ? {
        _id: wordObj._id,
        word: wordObj.word,
        pronunciations: wordObj.pronunciations,
        audioUrls: wordObj.audioUrls,
      } : undefined,
      meaning: meaningObj ? {
        _id: meaningObj._id,
        partOfSpeech: meaningObj.partOfSpeech,
        meaning: meaningObj.meaning,
        exampleSentence: meaningObj.exampleSentence,
        exampleMeaning: meaningObj.exampleMeaning,
      } : undefined,
    };
  });

  return {
    lesson,
    topic,
    lessonWords: sortLessonRelations(lessonWords),
    availableWords,
    error: error || lessonStoreError,
    isLoadingLesson,
    isLoadingWords,
    isLoadingLessonWords: isLoadingLesson,
    isSavingRelation: false,
    isAddWordModalOpen,
    openAddWordModal,
    closeAddWordModal,
    addWordToLesson,
    removeWordFromLesson,
    loadWordMeanings: wordMeaningApi.getByWord,
  };
}
