/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useGrammarTopicStore } from "@/stores/GrammarTopicStore";
import type { GrammarTopic } from "@/features/grammar/types";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Lỗi hệ thống, vui lòng thử lại sau.";
}

function sortByOrderThenLabel<T extends { order?: number; name?: string }>(
  items: T[],
) {
  return [...items].sort((a, b) => {
    const orderDelta =
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER);

    if (orderDelta !== 0) {
      return orderDelta;
    }

    const labelA = a.name ?? "";
    const labelB = b.name ?? "";
    return labelA.localeCompare(labelB);
  });
}

type TopicEditorState =
  | { mode: "create" }
  | { mode: "edit"; topic: GrammarTopic };

export function useGrammarTopicsController() {
  const {
    topics: storeTopics,
    isLoading,
    error: storeError,
    fetchAll,
    create,
    update,
    changeStatus,
    remove,
  } = useGrammarTopicStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [topicEditor, setTopicEditor] = useState<TopicEditorState | null>(null);

  const pageSize = 6;

  const loadTopics = useCallback(async () => {
    try {
      await fetchAll(1, 1000);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError));
    }
  }, [fetchAll]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTopics.length / pageSize),
  );
  const currentPage = Math.min(page, totalPages);
  const displayedTopics = filteredTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openCreateTopic = () => {
    setTopicEditor({ mode: "create" });
  };

  const openEditTopic = (topic: GrammarTopic) => {
    setTopicEditor({ mode: "edit", topic });
  };

  const closeTopicEditor = () => {
    setTopicEditor(null);
  };

  const saveTopic = async (payload: {
    name: string;
    description?: string;
  }) => {
    setIsSaving(true);

    try {
      const cleanPayload = {
        name: payload.name ?? "",
        description: payload.description,
      };

      if (topicEditor?.mode === "edit") {
        await update(topicEditor.topic._id, cleanPayload);
        toast.success("Đã cập nhật chủ đề.");
      } else {
        await create(cleanPayload);
        toast.success("Đã tạo chủ đề mới.");
      }

      closeTopicEditor();
      await loadTopics();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTopic = async (topic: GrammarTopic) => {
    try {
      await remove(topic._id);
      toast.success("Đã xóa chủ đề.");

      if (
        topicEditor?.mode === "edit" &&
        topicEditor.topic._id === topic._id
      ) {
        closeTopicEditor();
      }

      await loadTopics();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  const toggleTopicStatus = async (topic: GrammarTopic) => {
    try {
      await changeStatus(topic._id, !topic.isActive);
      toast.success(
        topic.isActive ? "Đã tạm ẩn chủ đề." : "Đã hiển thị chủ đề.",
      );
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
