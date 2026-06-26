/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import wordApi from "@/api/wordApi";
import wordMeaningApi from "@/api/wordMeaningApi";
import type {
  CreateVocabularyWordPayload,
  UpdateVocabularyWordPayload,
  VocabularyWord,
} from "@/features/vocabulary/types";

import {
  getErrorMessage,
  sortWordsByLabel,
} from "@/features/vocabulary/hooks/vocabularyHookUtils";

type WordEditorState =
  | { mode: "create" }
  | { mode: "edit"; word: VocabularyWord };

export function useWordsController() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordEditor, setWordEditor] = useState<WordEditorState | null>(null);

  const requestRef = useRef(0);
  const pageSize = 8;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredWords = words.filter((word) => {
    if (!normalizedSearch) return true;

    return (
      word.word.toLowerCase().includes(normalizedSearch) ||
      (word.meaningPreview || "").toLowerCase().includes(normalizedSearch) ||
      (word.meanings || []).some(
        (meaning) =>
          meaning.meaning.toLowerCase().includes(normalizedSearch) ||
          meaning.partOfSpeech.toLowerCase().includes(normalizedSearch),
      )
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayedWords = filteredWords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const loadWords = async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await wordApi.getAll(1, 100);
      const nextWords = sortWordsByLabel(res.words).map(
        (word) => ({
          ...word,
          meaningPreview:
            word.meaningPreview ?? word.meanings?.[0]?.meaning ?? undefined,
          meaningCount: word.meaningCount ?? word.meanings?.length,
        }),
      );

      if (requestId !== requestRef.current) return;

      setWords(nextWords);
    } catch (loadError) {
      if (requestId !== requestRef.current) return;

      const message = getErrorMessage(loadError);
      setWords([]);
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadWords();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreateWord = () => {
    setWordEditor({ mode: "create" });
  };

  const openEditWord = (word: VocabularyWord) => {
    setWordEditor({ mode: "edit", word });
  };

  const closeWordEditor = () => {
    setWordEditor(null);
  };

  const saveWord = async (
    payload: CreateVocabularyWordPayload | UpdateVocabularyWordPayload,
  ) => {
    setIsSaving(true);

    try {
      if (wordEditor?.mode === "edit") {
        await wordApi.update(wordEditor.word._id, payload);
        toast.success("Đã cập nhật word.");
      } else {
        const createPayload = payload as CreateVocabularyWordPayload;
        // Create word with primary meaning (index 0)
        const createdWord = await wordApi.create({
          word: createPayload.word,
          meaning: createPayload.meanings?.[0]?.meaning || "",
          partOfSpeech: (createPayload.meanings?.[0]?.partOfSpeech || "noun") as any,
        });

        // Add secondary meanings if any
        if (createPayload.meanings && createPayload.meanings.length > 1) {
          for (let i = 1; i < createPayload.meanings.length; i++) {
            const meaning = createPayload.meanings[i];
            await wordMeaningApi.create(createdWord._id, {
              partOfSpeech: meaning.partOfSpeech as any,
              meaning: meaning.meaning,
              exampleSentence: meaning.example,
            });
          }
        }

        toast.success("Đã tạo word mới.");
      }

      closeWordEditor();
      await loadWords();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
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

  const deleteWord = async (word: VocabularyWord) => {
    try {
      await wordApi.remove(word._id);
      toast.success("Đã xóa word.");

      if (wordEditor?.mode === "edit" && wordEditor.word._id === word._id) {
        closeWordEditor();
      }

      await loadWords();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  return {
    words: displayedWords,
    totalWords: filteredWords.length,
    totalPages,
    page: currentPage,
    pageSize,
    search,
    setSearch,
    setPage,
    error,
    isLoading,
    isSaving,
    wordEditor,
    openCreateWord,
    openEditWord,
    closeWordEditor,
    saveWord,
    generateAudio,
    deleteWord,
  };
}

