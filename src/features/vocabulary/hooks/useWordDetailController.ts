/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useWordStore } from "@/stores/wordStore";
import { useWordMeaningStore } from "@/stores/wordMeaningStore";
import type { WordMeaning } from "@/api/wordMeaningApi";
import type {
  VocabularyMeaning,
  VocabularyWord,
  UpdateVocabularyWordPayload,
} from "@/features/vocabulary/types";

import { getErrorMessage } from "@/features/vocabulary/hooks/vocabularyHookUtils";

type PartOfSpeech = WordMeaning["partOfSpeech"];

type MeaningEditorState =
  | { mode: "create" }
  | { mode: "edit"; meaning: VocabularyMeaning };

type WordEditorState = { mode: "edit"; word: VocabularyWord };

type MeaningFormPayload = {
  partOfSpeech: string;
  meaning: string;
  example?: string;
};

export function useWordDetailController(wordSlug?: string) {
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

  const loadWord = useCallback(
    async (nextWordSlug?: string) => {
      const currentWordSlug = nextWordSlug ?? wordSlug;

      if (!currentWordSlug) {
        setError("Thiếu wordSlug.");
        return;
      }

      const requestId = ++wordRequestRef.current;

      try {
        await fetchWordById(currentWordSlug);
      } catch (loadError) {
        if (requestId !== wordRequestRef.current) return;
        const message = getErrorMessage(loadError);
        setError(message);
        toast.error(message);
      }
    },
    [wordSlug, fetchWordById],
  );

  const loadMeanings = useCallback(
    async (nextWordSlug?: string) => {
      const currentWordSlug = nextWordSlug ?? wordSlug;

      if (!currentWordSlug) {
        return;
      }

      const requestId = ++meaningRequestRef.current;

      try {
        await fetchByWord(currentWordSlug);
      } catch (loadError) {
        if (requestId !== meaningRequestRef.current) return;
        const message = getErrorMessage(loadError);
        setError(message);
        toast.error(message);
      }
    },
    [wordSlug, fetchByWord],
  );

  useEffect(() => {
    setError(null);
    if (!wordSlug) {
      setError("Thiếu wordSlug.");
      return;
    }
    void loadWord();
    void loadMeanings();
  }, [wordSlug, loadWord, loadMeanings]);

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
      await updateWordInStore(word.slug, payload);
      toast.success("Đã cập nhật word.");
      closeWordEditor();
      await Promise.all([loadWord(word.slug), loadMeanings(word.slug)]);
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
      await removeWordInStore(word.slug);
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
        await updateMeaning(word.slug, meaningEditor.meaning._id, {
          partOfSpeech: payload.partOfSpeech as PartOfSpeech,
          meaning: payload.meaning,
          exampleSentence: payload.example,
        });
        toast.success("Đã cập nhật meaning.");
      } else {
        await createMeaning(word.slug, {
          partOfSpeech: payload.partOfSpeech as PartOfSpeech,
          meaning: payload.meaning,
          exampleSentence: payload.example,
        });
        toast.success("Đã tạo meaning mới.");
      }

      closeMeaningEditor();
      await Promise.all([loadWord(word.slug), loadMeanings(word.slug)]);
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  };

  const deleteMeaning = async (meaning: VocabularyMeaning) => {
    if (!word) return;
    try {
      await removeMeaning(word.slug, meaning._id);
      toast.success("Đã xóa meaning.");
      await Promise.all([loadWord(word.slug), loadMeanings(word.slug)]);
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
