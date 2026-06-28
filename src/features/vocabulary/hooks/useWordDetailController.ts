/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useWordStore } from "@/stores/wordStore";
import { useWordMeaningStore } from "@/stores/wordMeaningStore";
import type {
  VocabularyMeaning,
  VocabularyWord,
  UpdateVocabularyWordPayload,
} from "@/features/vocabulary/types";

import { getErrorMessage } from "@/features/vocabulary/hooks/vocabularyHookUtils";

type MeaningEditorState =
  | { mode: "create" }
  | { mode: "edit"; meaning: VocabularyMeaning };

type WordEditorState = { mode: "edit"; word: VocabularyWord };

type MeaningFormPayload = {
  partOfSpeech: string;
  meaning: string;
  example?: string;
};

export function useWordDetailController(wordId?: string) {
  const [error, setError] = useState<string | null>(null);
  const [meaningEditor, setMeaningEditor] = useState<MeaningEditorState | null>(
    null,
  );
  const [wordEditor, setWordEditor] = useState<WordEditorState | null>(null);

  const {
    selectedWord: word,
    isLoading: isLoadingWord,
    error: wordStoreError,
    getById: fetchWordById,
    update: updateWordInStore,
    remove: removeWordInStore,
  } = useWordStore();

  const {
    meanings,
    isLoading: isLoadingMeanings,
    error: meaningStoreError,
    fetchByWord,
    create: createMeaning,
    update: updateMeaning,
    remove: removeMeaning,
  } = useWordMeaningStore();

  const wordRequestRef = useRef(0);
  const meaningRequestRef = useRef(0);

  const loadWord = async (nextWordId?: string) => {
    const currentWordId = nextWordId ?? wordId;

    if (!currentWordId) {
      setError("Thiếu wordId.");
      return;
    }

    const requestId = ++wordRequestRef.current;

    try {
      await fetchWordById(currentWordId);
    } catch (loadError) {
      if (requestId !== wordRequestRef.current) return;
      const message = getErrorMessage(loadError);
      setError(message);
      toast.error(message);
    }
  };

  const loadMeanings = async (nextWordId?: string) => {
    const currentWordId = nextWordId ?? wordId;

    if (!currentWordId) {
      return;
    }

    const requestId = ++meaningRequestRef.current;

    try {
      await fetchByWord(currentWordId);
    } catch (loadError) {
      if (requestId !== meaningRequestRef.current) return;
      const message = getErrorMessage(loadError);
      setError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    setError(null);
    void loadWord();
    void loadMeanings();
  }, [wordId]);

  const openCreateMeaning = () => {
    if (!word) {
      toast.info("Word chưa sẵn sàng.");
      return;
    }

    setMeaningEditor({ mode: "create" });
  };

  const openEditMeaning = (meaning: VocabularyMeaning) => {
    setMeaningEditor({ mode: "edit", meaning });
  };

  const closeMeaningEditor = () => {
    setMeaningEditor(null);
  };

  const openEditWord = () => {
    if (!word) {
      toast.info("Word chưa sẵn sàng.");
      return;
    }

    setWordEditor({ mode: "edit", word });
  };

  const closeWordEditor = () => {
    setWordEditor(null);
  };

  const saveWord = async (payload: UpdateVocabularyWordPayload) => {
    if (!word) {
      toast.info("Word chưa sẵn sàng.");
      return;
    }

    try {
      await updateWordInStore(word._id, payload);
      toast.success("Đã cập nhật word.");
      closeWordEditor();
      await Promise.all([loadWord(word._id), loadMeanings(word._id)]);
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  };

  const deleteWord = async () => {
    if (!word) {
      toast.info("Word chưa sẵn sàng.");
      return false;
    }

    try {
      await removeWordInStore(word._id);
      toast.success("Đã xóa word.");
      return true;
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
      return false;
    }
  };

  const saveMeaning = async (payload: MeaningFormPayload) => {
    if (!word) {
      toast.info("Word chưa sẵn sàng.");
      return;
    }

    try {
      if (meaningEditor?.mode === "edit") {
        await updateMeaning(word._id, meaningEditor.meaning._id, {
          partOfSpeech: payload.partOfSpeech as any,
          meaning: payload.meaning,
          exampleSentence: payload.example,
        });
        toast.success("Đã cập nhật meaning.");
      } else {
        await createMeaning(word._id, {
          partOfSpeech: payload.partOfSpeech as any,
          meaning: payload.meaning,
          exampleSentence: payload.example,
        });
        toast.success("Đã tạo meaning mới.");
      }

      closeMeaningEditor();
      await Promise.all([loadWord(word._id), loadMeanings(word._id)]);
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  };

  const deleteMeaning = async (meaning: VocabularyMeaning) => {
    if (!word) return;
    try {
      await removeMeaning(word._id, meaning._id);
      toast.success("Đã xóa meaning.");
      await Promise.all([loadWord(word._id), loadMeanings(word._id)]);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  return {
    word,
    meanings,
    error: error || wordStoreError || meaningStoreError,
    isLoadingWord,
    isLoadingMeanings,
    isSavingWord: false,
    isSavingMeaning: false,
    meaningEditor,
    wordEditor,
    openCreateMeaning,
    openEditMeaning,
    closeMeaningEditor,
    openEditWord,
    closeWordEditor,
    saveWord,
    deleteWord,
    saveMeaning,
    deleteMeaning,
  };
}
