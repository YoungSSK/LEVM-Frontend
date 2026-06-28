/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useVocabularyTopicStore } from "@/stores/VocabularyTopicStore";
import type {
  CreateVocabularyTopicPayload,
  UpdateVocabularyTopicPayload,
  VocabularyTopic,
} from "@/features/vocabulary/types";

import {
  getErrorMessage,
  sortByOrderThenLabel,
} from "@/features/vocabulary/hooks/vocabularyHookUtils";

type TopicEditorState =
  | { mode: "create" }
  | { mode: "edit"; topic: VocabularyTopic };

export function useTopicsController() {
  const {
    topics: storeTopics,
    isLoading,
    error: storeError,
    fetchAll,
    create,
    update,
    changeStatus,
    remove,
  } = useVocabularyTopicStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [topicEditor, setTopicEditor] = useState<TopicEditorState | null>(null);

  const pageSize = 6;

  const loadTopics = async () => {
    try {
      await fetchAll(1, 1000);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError));
    }
  };

  useEffect(() => {
    void loadTopics();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const sortedTopics = sortByOrderThenLabel(storeTopics);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTopics = sortedTopics.filter((topic) => {
    if (!normalizedSearch) return true;

    return (
      topic.name.toLowerCase().includes(normalizedSearch) ||
      topic.description.toLowerCase().includes(normalizedSearch)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayedTopics = filteredTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openCreateTopic = () => {
    setTopicEditor({ mode: "create" });
  };

  const openEditTopic = (topic: VocabularyTopic) => {
    setTopicEditor({ mode: "edit", topic });
  };

  const closeTopicEditor = () => {
    setTopicEditor(null);
  };

  const saveTopic = async (
    payload: CreateVocabularyTopicPayload | UpdateVocabularyTopicPayload,
  ) => {
    setIsSaving(true);

    try {
      const cleanPayload = {
        name: payload.name ?? "",
        description: payload.description,
        thumbnail: payload.thumbnail,
      };

      if (topicEditor?.mode === "edit") {
        await update(topicEditor.topic._id, cleanPayload);
        toast.success("Đã cập nhật topic.");
      } else {
        await create(cleanPayload);
        toast.success("Đã tạo topic mới.");
      }

      closeTopicEditor();
      await loadTopics();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTopic = async (topic: VocabularyTopic) => {
    try {
      await remove(topic._id);
      toast.success("Đã xóa topic.");

      if (topicEditor?.mode === "edit" && topicEditor.topic._id === topic._id) {
        closeTopicEditor();
      }

      await loadTopics();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };
  const toggleTopicStatus = async (topic: VocabularyTopic) => {
    try {
      await changeStatus(topic._id, !topic.isActive);
      toast.success(topic.isActive ? "Đã tạm ẩn topic." : "Đã hiển thị topic.");
      await loadTopics();
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError));
    }
  };

  return {
    topics: displayedTopics,
    totalTopics: filteredTopics.length,
    totalPages,
    page: currentPage,
    pageSize,
    search,
    setSearch,
    setPage,
    error: storeError,
    isLoading,
    isSaving,
    topicEditor,
    openCreateTopic,
    openEditTopic,
    closeTopicEditor,
    saveTopic,
    deleteTopic,
    toggleTopicStatus,
  };
}
