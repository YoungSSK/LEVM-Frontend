import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import readingCategoryApi from "@/api/readingCategoryApi";
import readingPassageApi from "@/api/readingPassageApi";
import type { ReadingCategory, ReadingDifficulty, ReadingCefrLevel, ReadingType } from "@/api/readingCategoryApi";
import type { ReadingPassage, ReadingPassageStatus } from "@/api/readingPassageApi";
import { readingRoutePaths } from "@/features/reading/routes/readingRoutes";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi hệ thống, vui lòng thử lại.";
}

type PassageEditorState =
  | { mode: "create" }
  | { mode: "edit"; passage: ReadingPassage };

export function useReadingCategoryDetailController(categorySlug?: string) {
  const navigate = useNavigate();
  const [category, setCategory] = useState<ReadingCategory | null>(null);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isLoadingPassages, setIsLoadingPassages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passageEditor, setPassageEditor] = useState<PassageEditorState | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReadingPassageStatus | "">("");

  const categoryRequestRef = useRef(0);

  const loadCategory = useCallback(async (slug?: string) => {
    const currentSlug = slug ?? categorySlug;
    if (!currentSlug) {
      setCategory(null);
      setError("Thiếu category slug.");
      return;
    }

    const requestId = ++categoryRequestRef.current;
    setIsLoadingCategory(true);

    try {
      const cat = await readingCategoryApi.getBySlug(currentSlug);
      if (requestId !== categoryRequestRef.current) return;
      setCategory(cat);
    } catch (err) {
      if (requestId !== categoryRequestRef.current) return;
      const msg = getErrorMessage(err);
      setCategory(null);
      setError(msg);
      toast.error(msg);
    } finally {
      if (requestId === categoryRequestRef.current) {
        setIsLoadingCategory(false);
      }
    }
  }, [categorySlug]);

  const loadPassages = useCallback(async () => {
    if (!category) return;
    setIsLoadingPassages(true);

    try {
      const result = await readingPassageApi.getAll({
        categoryId: category._id,
        status: statusFilter || undefined,
        limit: 100,
        sortBy: "order",
        sortOrder: "asc",
      });
      setPassages(result.passages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoadingPassages(false);
    }
  }, [category, statusFilter]);

  useEffect(() => {
    setError(null);
    void loadCategory();
  }, [loadCategory]);

  useEffect(() => {
    if (category) {
      void loadPassages();
    }
  }, [loadPassages, category]);

  const openCreatePassage = () => {
    if (!category) {
      toast.info("Hãy chờ category tải xong.");
      return;
    }
    setPassageEditor({ mode: "create" });
  };

  const openEditPassage = (passage: ReadingPassage) => {
    setPassageEditor({ mode: "edit", passage });
  };

  const closePassageEditor = () => {
    setPassageEditor(null);
  };

  const savePassage = async (payload: {
    categoryId: string;
    title: string;
    description?: string;
    thumbnail?: string;
    difficulty: ReadingDifficulty;
    cefrLevel: ReadingCefrLevel;
    readingType: ReadingType;
    tags: string[];
    estimatedTime?: number;
    xpReward: number;
    passThreshold: number;
    htmlContent?: string;
  }) => {
    if (!category) return;
    setIsSubmitting(true);

    try {
      if (passageEditor?.mode === "edit") {
        await readingPassageApi.update(passageEditor.passage._id, payload);
        toast.success("Đã cập nhật bài đọc.");
      } else {
        if (!payload.htmlContent) {
          toast.error("Cần có nội dung HTML để tạo bài đọc.");
          return;
        }
        const created = await readingPassageApi.create({
          ...payload,
          htmlContent: payload.htmlContent,
        });
        toast.success("Đã tạo bài đọc mới.");
        navigate(readingRoutePaths.passageDetail(created.slug));
        return;
      }
      closePassageEditor();
      await loadPassages();
      await loadCategory(category.slug);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePassage = async (passage: ReadingPassage) => {
    try {
      await readingPassageApi.delete(passage._id);
      toast.success("Đã xóa bài đọc.");
      if (passageEditor?.mode === "edit" && passageEditor.passage._id === passage._id) {
        closePassageEditor();
      }
      if (category) {
        await loadPassages();
        await loadCategory(category.slug);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changeStatus = async (passage: ReadingPassage, status: ReadingPassageStatus) => {
    try {
      await readingPassageApi.changeStatus(passage._id, status);
      const msg: Record<ReadingPassageStatus, string> = {
        draft: "Đã chuyển về bản nháp.",
        published: "Đã xuất bản bài đọc.",
        archived: "Đã lưu trữ bài đọc.",
      };
      toast.success(msg[status] ?? "Đã cập nhật trạng thái.");
      await loadPassages();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const clonePassage = async (passage: ReadingPassage) => {
    try {
      const cloned = await readingPassageApi.clone(passage._id);
      toast.success("Clone thành công. Đang mở bài đọc mới...");
      navigate(readingRoutePaths.passageDetail(cloned.slug));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return {
    category,
    passages,
    error,
    isLoadingCategory,
    isLoadingPassages,
    isSubmitting,
    passageEditor,
    statusFilter,
    setStatusFilter,
    openCreatePassage,
    openEditPassage,
    closePassageEditor,
    savePassage,
    deletePassage,
    changeStatus,
    clonePassage,
    loadPassages,
  };
}
