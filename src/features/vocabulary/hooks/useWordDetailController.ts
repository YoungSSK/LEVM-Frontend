/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useWordStore } from "@/stores/wordStore";
import { useWordMeaningStore } from "@/stores/wordMeaningStore";
import type {
  UpdateVocabularyWordPayload,
  VocabularyMeaning,
  VocabularyWord,
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

  const generateAudio = async (payload: { word: string; phonetic?: string }) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(payload.word)}`);
      if (!res.ok) throw new Error("Không tìm thấy audio trên từ điển.");
      const data = await res.json();
      const phonetics = data[0]?.phonetics || [];
      const usPhonetic = phonetics.find((item: any) => item.audio && item.audio.toLowerCase().includes("-us.mp3"));
      const ukPhonetic = phonetics.find((item: any) => item.audio && item.audio.toLowerCase().includes("-uk.mp3"));
      const audioUrl = usPhonetic?.audio || ukPhonetic?.audio || phonetics.find((item: any) => item.audio)?.audio || "";
      if (!audioUrl) throw new Error("Không có audio cho từ này.");
      return audioUrl;
    } catch (e) {
      toast.error(getErrorMessage(e));
      return "";
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
    generateAudio,
    deleteWord,
    saveMeaning,
    deleteMeaning,
  };
}

