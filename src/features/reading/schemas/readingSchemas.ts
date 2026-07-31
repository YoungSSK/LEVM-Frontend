type FieldErrors<T extends string> = Partial<Record<T, string>>;

// ===== Reading Category =====

export interface ReadingCategoryFormValues {
  name: string;
  description: string;
  thumbnail: string;
  color: string;
  order: string;
}

export interface ReadingCategoryFormResult {
  errors: FieldErrors<"name" | "description" | "thumbnail" | "color" | "order">;
  values?: {
    name: string;
    description?: string;
    thumbnail?: string;
    color?: string;
    order?: number;
  };
}

export function validateReadingCategoryForm(
  values: ReadingCategoryFormValues,
): ReadingCategoryFormResult {
  const name = values.name.trim().replace(/\s+/g, " ");
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const color = values.color.trim();
  const orderStr = values.order.trim();
  const order =
    orderStr === "" ? 0 : Number.parseInt(orderStr, 10);

  const errors: FieldErrors<"name" | "description" | "thumbnail" | "color" | "order"> = {};

  if (!name) {
    errors.name = "Tên danh mục không được để trống.";
  } else if (name.length > 200) {
    errors.name = "Tên danh mục không được vượt quá 200 ký tự.";
  }

  if (description.length > 1000) {
    errors.description = "Mô tả không được vượt quá 1000 ký tự.";
  }

  if (thumbnail && !thumbnail.startsWith("http")) {
    errors.thumbnail = "Thumbnail phải là URL hợp lệ.";
  }

  if (orderStr !== "" && (!Number.isInteger(order) || order < 0)) {
    errors.order = "Thứ tự hiển thị phải là số nguyên không âm.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          name,
          description: description || undefined,
          thumbnail: thumbnail || undefined,
          color: color || undefined,
          order,
        },
      };
}

// ===== Reading Passage =====

export type PassageDifficulty =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "upper_intermediate"
  | "advanced";
export type PassageCefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PassageReadingType =
  | "academic"
  | "general"
  | "narrative"
  | "descriptive"
  | "expository"
  | "argumentative"
  | "article"
  | "advertisement"
  | "notice"
  | "letter"
  | "report"
  | "other";

export interface ReadingPassageFormValues {
  categoryId: string;
  title: string;
  description: string;
  thumbnail: string;
  difficulty: PassageDifficulty;
  cefrLevel: PassageCefrLevel;
  readingType: PassageReadingType;
  tags: string; // comma-separated
  estimatedTime: string;
  xpReward: string;
  passThreshold: string;
}

export interface ReadingPassageFormResult {
  errors: FieldErrors<
    | "categoryId"
    | "title"
    | "description"
    | "thumbnail"
    | "difficulty"
    | "cefrLevel"
    | "readingType"
    | "tags"
    | "estimatedTime"
    | "xpReward"
    | "passThreshold"
  >;
  values?: {
    categoryId: string;
    title: string;
    description?: string;
    thumbnail?: string;
    difficulty: PassageDifficulty;
    cefrLevel: PassageCefrLevel;
    readingType: PassageReadingType;
    tags: string[];
    estimatedTime?: number;
    xpReward: number;
    passThreshold: number;
  };
}

export function validateReadingPassageForm(
  values: ReadingPassageFormValues,
): ReadingPassageFormResult {
  const title = values.title.trim().replace(/\s+/g, " ");
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const tagsRaw = values.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const estimatedTimeStr = values.estimatedTime.trim();
  const estimatedTime =
    estimatedTimeStr === ""
      ? undefined
      : Number.parseInt(estimatedTimeStr, 10);
  const xpReward = Number.parseInt(values.xpReward.trim() || "15", 10);
  const passThreshold = Number.parseInt(values.passThreshold.trim() || "70", 10);

  type ErrorKey =
    | "categoryId"
    | "title"
    | "description"
    | "thumbnail"
    | "difficulty"
    | "cefrLevel"
    | "readingType"
    | "tags"
    | "estimatedTime"
    | "xpReward"
    | "passThreshold";

  const errors: FieldErrors<ErrorKey> = {};

  if (!values.categoryId) {
    errors.categoryId = "Vui lòng chọn danh mục.";
  }

  if (!title) {
    errors.title = "Tiêu đề bài đọc không được để trống.";
  } else if (title.length > 300) {
    errors.title = "Tiêu đề không được vượt quá 300 ký tự.";
  }

  if (description.length > 1000) {
    errors.description = "Mô tả không được vượt quá 1000 ký tự.";
  }

  if (thumbnail && !thumbnail.startsWith("http")) {
    errors.thumbnail = "Thumbnail phải là URL hợp lệ.";
  }

  if (tagsRaw.length > 20) {
    errors.tags = "Tối đa 20 tags.";
  }

  if (
    estimatedTime !== undefined &&
    (!Number.isInteger(estimatedTime) || estimatedTime < 0)
  ) {
    errors.estimatedTime = "Thời gian ước tính phải là số nguyên không âm.";
  }

  if (!Number.isInteger(xpReward) || xpReward < 0 || xpReward > 1000) {
    errors.xpReward = "XP thưởng phải là số nguyên từ 0 đến 1000.";
  }

  if (
    !Number.isInteger(passThreshold) ||
    passThreshold < 0 ||
    passThreshold > 100
  ) {
    errors.passThreshold = "Ngưỡng đạt phải là số nguyên từ 0 đến 100.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          categoryId: values.categoryId,
          title,
          description: description || undefined,
          thumbnail: thumbnail || undefined,
          difficulty: values.difficulty,
          cefrLevel: values.cefrLevel,
          readingType: values.readingType,
          tags: tagsRaw,
          estimatedTime,
          xpReward,
          passThreshold,
        },
      };
}
