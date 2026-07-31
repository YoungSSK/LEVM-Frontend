import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import readingCategoryApi from "@/api/readingCategoryApi";
import type { ReadingCategory } from "@/api/readingCategoryApi";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi hệ thống, vui lòng thử lại.";
}

type CategoryEditorState =
  | { mode: "create" }
  | { mode: "edit"; category: ReadingCategory };

export function useReadingCategoryController() {
  const [categories, setCategories] = useState<ReadingCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryEditor, setCategoryEditor] =
    useState<CategoryEditorState | null>(null);
  const [search, setSearch] = useState("");

  const requestRef = useRef(0);

  const loadCategories = useCallback(async (searchQuery?: string) => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await readingCategoryApi.getAll(1, 50, {
        search: searchQuery ?? search,
        sortBy: "order",
        sortOrder: "asc",
      });

      if (requestId !== requestRef.current) return;

      setCategories(result.categories);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      if (requestId === requestRef.current) {
        setIsLoading(false);
      }
    }
  }, [search]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openCreateCategory = () => {
    setCategoryEditor({ mode: "create" });
  };

  const openEditCategory = (category: ReadingCategory) => {
    setCategoryEditor({ mode: "edit", category });
  };

  const closeCategoryEditor = () => {
    setCategoryEditor(null);
  };

  const saveCategory = async (payload: {
    name: string;
    description?: string;
    thumbnail?: string;
    color?: string;
    order?: number;
  }) => {
    setIsSubmitting(true);
    try {
      if (categoryEditor?.mode === "edit") {
        await readingCategoryApi.update(categoryEditor.category._id, payload);
        toast.success("Đã cập nhật danh mục.");
      } else {
        await readingCategoryApi.create(payload);
        toast.success("Đã tạo danh mục mới.");
      }
      closeCategoryEditor();
      await loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (category: ReadingCategory) => {
    try {
      await readingCategoryApi.delete(category._id);
      toast.success("Đã xóa danh mục.");
      await loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleStatus = async (category: ReadingCategory) => {
    try {
      await readingCategoryApi.toggleStatus(category._id, !category.isActive);
      toast.success(category.isActive ? "Đã ẩn danh mục." : "Đã kích hoạt danh mục.");
      await loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    void loadCategories(value);
  };

  return {
    categories,
    error,
    isLoading,
    isSubmitting,
    categoryEditor,
    search,
    openCreateCategory,
    openEditCategory,
    closeCategoryEditor,
    saveCategory,
    deleteCategory,
    toggleStatus,
    handleSearchChange,
  };
}
