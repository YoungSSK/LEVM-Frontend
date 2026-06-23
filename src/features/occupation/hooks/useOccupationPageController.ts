/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import occupationApi, {
  type Occupation,
} from "@/api/occupationApi";
import occupationCategoryApi, {
  type OccupationCategory,
} from "@/api/occupationCategoryApi";

type CategoryEditorState =
  | { mode: "create" }
  | { mode: "edit"; category: OccupationCategory };

type OccupationEditorState =
  | { mode: "create" }
  | { mode: "edit"; occupation: Occupation };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi hệ thống, vui lòng thử lại sau.";
}

export function useOccupationPageController() {
  const [categories, setCategories] = useState<OccupationCategory[]>([]);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedOccupationId, setSelectedOccupationId] = useState<
    string | null
  >(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [occupationsError, setOccupationsError] = useState<string | null>(
    null,
  );
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isOccupationsLoading, setIsOccupationsLoading] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingOccupation, setIsSavingOccupation] = useState(false);
  const [categoryEditor, setCategoryEditor] =
    useState<CategoryEditorState | null>(null);
  const [occupationEditor, setOccupationEditor] =
    useState<OccupationEditorState | null>(null);

  const categoriesRequestRef = useRef(0);
  const occupationsRequestRef = useRef(0);

  const selectedCategory =
    categories.find((category) => category._id === selectedCategoryId) ?? null;
  const selectedOccupation =
    occupations.find((occupation) => occupation._id === selectedOccupationId) ??
    null;

  const activeCategoryCount = categories.filter(
    (category) => category.isActive,
  ).length;
  const activeOccupationCount = occupations.filter(
    (occupation) => occupation.isActive,
  ).length;

  const loadCategories = async (preferredCategoryId?: string | null) => {
    const requestId = ++categoriesRequestRef.current;
    setIsCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const nextCategories = await occupationCategoryApi.getAll();

      if (requestId !== categoriesRequestRef.current) return;

      setCategories(nextCategories);

      const nextSelectedCategoryId =
        preferredCategoryId &&
        nextCategories.some((category) => category._id === preferredCategoryId)
          ? preferredCategoryId
          : nextCategories[0]?._id ?? null;

      setSelectedCategoryId(nextSelectedCategoryId);

      if (!nextSelectedCategoryId) {
        setSelectedOccupationId(null);
        setOccupations([]);
      }
    } catch (error) {
      if (requestId !== categoriesRequestRef.current) return;

      const message = getErrorMessage(error);
      setCategories([]);
      setSelectedCategoryId(null);
      setSelectedOccupationId(null);
      setOccupations([]);
      setCategoriesError(message);
      toast.error(message);
    } finally {
      if (requestId === categoriesRequestRef.current) {
        setIsCategoriesLoading(false);
      }
    }
  };

  const loadOccupations = async (categoryId: string | null) => {
    const requestId = ++occupationsRequestRef.current;

    if (!categoryId) {
      setOccupations([]);
      setSelectedOccupationId(null);
      setOccupationsError(null);
      return;
    }

    setIsOccupationsLoading(true);
    setOccupationsError(null);

    try {
      const nextOccupations = await occupationApi.getByCategory(categoryId);

      if (requestId !== occupationsRequestRef.current) return;

      setOccupations(nextOccupations);
      setSelectedOccupationId((currentId) => {
        if (currentId && nextOccupations.some((item) => item._id === currentId)) {
          return currentId;
        }

        return nextOccupations[0]?._id ?? null;
      });
    } catch (error) {
      if (requestId !== occupationsRequestRef.current) return;

      const message = getErrorMessage(error);
      setOccupations([]);
      setSelectedOccupationId(null);
      setOccupationsError(message);
      toast.error(message);
    } finally {
      if (requestId === occupationsRequestRef.current) {
        setIsOccupationsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadOccupations(selectedCategoryId);
  }, [selectedCategoryId]);

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedOccupationId(null);
  };

  const selectOccupation = (occupationId: string) => {
    setSelectedOccupationId(occupationId);
  };

  const openCreateCategory = () => {
    setCategoryEditor({ mode: "create" });
  };

  const openEditCategory = (category: OccupationCategory) => {
    setCategoryEditor({ mode: "edit", category });
  };

  const closeCategoryEditor = () => {
    setCategoryEditor(null);
  };

  const openCreateOccupation = () => {
    if (!selectedCategoryId) {
      toast.info("Hãy chọn một nhóm ngành nghề trước.");
      return;
    }

    setOccupationEditor({ mode: "create" });
  };

  const openEditOccupation = (occupation: Occupation) => {
    setOccupationEditor({ mode: "edit", occupation });
  };

  const closeOccupationEditor = () => {
    setOccupationEditor(null);
  };

  const saveCategory = async (payload: { name: string; description?: string }) => {
    setIsSavingCategory(true);

    try {
      if (categoryEditor?.mode === "edit") {
        await occupationCategoryApi.update(categoryEditor.category._id, payload);
        toast.success("Đã cập nhật nhóm ngành.");
      } else {
        const createdCategory = await occupationCategoryApi.create(payload);
        toast.success("Đã thêm nhóm ngành.");
        closeCategoryEditor();
        await loadCategories(createdCategory._id);
        return;
      }

      closeCategoryEditor();
      await loadCategories(selectedCategoryId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const deleteCategory = async (category: OccupationCategory) => {
    const confirmed = window.confirm(
      `Bạn chắc có muốn xóa nhóm ngành "${category.name}" không?`,
    );

    if (!confirmed) return;

    try {
      await occupationCategoryApi.remove(category._id);
      toast.success("Đã xóa nhóm ngành.");
      if (categoryEditor?.mode === "edit" && categoryEditor.category._id === category._id) {
        closeCategoryEditor();
      }
      await loadCategories(
        selectedCategoryId === category._id ? null : selectedCategoryId,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleCategoryStatus = async (category: OccupationCategory) => {
    try {
      await occupationCategoryApi.update(category._id, {
        isActive: !category.isActive,
      });
      toast.success(
        category.isActive ? "Đã tạm ẩn nhóm ngành." : "Đã bật nhóm ngành.",
      );
      await loadCategories(selectedCategoryId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const saveOccupation = async (payload: {
    categoryId: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    if (!selectedCategoryId && occupationEditor?.mode === "create") {
      toast.info("Hãy chọn một nhóm ngành nghề trước.");
      return;
    }

    setIsSavingOccupation(true);

    try {
      if (occupationEditor?.mode === "edit") {
        await occupationApi.update(occupationEditor.occupation._id, payload);
        toast.success("Đã cập nhật ngành nghề.");
      } else {
        await occupationApi.create(payload);
        toast.success("Đã thêm ngành nghề.");
      }

      closeOccupationEditor();

      if (selectedCategoryId) {
        await loadOccupations(selectedCategoryId);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingOccupation(false);
    }
  };

  const toggleOccupationStatus = async (occupation: Occupation) => {
    try {
      await occupationApi.update(occupation._id, {
        isActive: !occupation.isActive,
      });
      toast.success(
        occupation.isActive ? "Đã tạm ẩn ngành nghề." : "Đã bật ngành nghề.",
      );

      if (selectedCategoryId) {
        await loadOccupations(selectedCategoryId);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    categories,
    occupations,
    selectedCategoryId,
    selectedOccupationId,
    selectedCategory,
    selectedOccupation,
    categoriesError,
    occupationsError,
    isCategoriesLoading,
    isOccupationsLoading,
    isSavingCategory,
    isSavingOccupation,
    categoryEditor,
    occupationEditor,
    activeCategoryCount,
    activeOccupationCount,
    selectCategory,
    selectOccupation,
    openCreateCategory,
    openEditCategory,
    closeCategoryEditor,
    openCreateOccupation,
    openEditOccupation,
    closeOccupationEditor,
    saveCategory,
    deleteCategory,
    toggleCategoryStatus,
    saveOccupation,
    toggleOccupationStatus,
  };
}
