import type { LessonType } from "@/api/grammarLessonApi";

type FieldErrors<T extends string> = Partial<Record<T, string>>;

export interface GrammarTopicFormValues {
  name: string;
  description: string;
}

export interface GrammarTopicFormResult {
  errors: FieldErrors<"name" | "description">;
  values?: {
    name: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  };
}

export function validateGrammarTopicForm(
  values: GrammarTopicFormValues,
): GrammarTopicFormResult {
  const name = values.name.trim();
  const description = values.description.trim();
  const errors: FieldErrors<"name" | "description"> = {};

  if (!name) {
    errors.name = "Tên chủ đề không được để trống.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          name,
          description: description || undefined,
        },
      };
}

export interface GrammarLessonFormValues {
  title: string;
  shortDescription: string;
  htmlContent: string;
  thumbnailUrl: string;
  estimatedTime: string;
  lessonType: LessonType;
  parentLessonId: string;
}

export interface GrammarLessonFormResult {
  errors: FieldErrors<"title" | "shortDescription" | "htmlContent" | "thumbnailUrl" | "estimatedTime">;
  values?: {
    topicId: string;
    title: string;
    shortDescription?: string;
    htmlContent?: string;
    thumbnailUrl?: string;
    estimatedTime?: number;
    order?: number;
    isPublished?: boolean;
    isActive?: boolean;
    lessonType?: LessonType;
    parentLessonId?: string | null;
  };
}

export function validateGrammarLessonForm(
  values: GrammarLessonFormValues & { topicId: string },
): GrammarLessonFormResult {
  const title = values.title.trim();
  const shortDescription = values.shortDescription.trim();
  const htmlContent = values.htmlContent.trim();
  const thumbnailUrl = values.thumbnailUrl.trim();
  const estimatedTime =
    values.estimatedTime.trim() === ""
      ? undefined
      : Number.parseInt(values.estimatedTime, 10);
  const lessonType = values.lessonType || "theory";
  const parentLessonId =
    values.parentLessonId.trim() === "" ? null : values.parentLessonId.trim() || null;

  const errors: FieldErrors<
    "title" | "shortDescription" | "htmlContent" | "thumbnailUrl" | "estimatedTime"
  > = {};

  if (!title) {
    errors.title = "Tiêu đề bài học không được để trống.";
  }

  if (
    estimatedTime !== undefined &&
    (!Number.isInteger(estimatedTime) || estimatedTime < 0)
  ) {
    errors.estimatedTime = "Thời gian ước tính phải là số nguyên không âm.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          topicId: values.topicId,
          title,
          shortDescription: shortDescription || undefined,
          htmlContent: htmlContent || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          estimatedTime,
          lessonType,
          parentLessonId,
        },
      };
}
