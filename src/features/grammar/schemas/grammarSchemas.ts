type FieldErrors<T extends string> = Partial<Record<T, string>>;

export interface GrammarTopicFormValues {
  name: string;
  description: string;
  thumbnail: string;
}

export interface GrammarTopicFormResult {
  errors: FieldErrors<"name" | "description" | "thumbnail">;
  values?: {
    name: string;
    description?: string;
    thumbnail?: string;
    order?: number;
    isActive?: boolean;
  };
}

export function validateGrammarTopicForm(
  values: GrammarTopicFormValues,
): GrammarTopicFormResult {
  const name = values.name.trim();
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const errors: FieldErrors<"name" | "description" | "thumbnail"> = {};

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
          thumbnail: thumbnail || undefined,
        },
      };
}

export interface GrammarLessonFormValues {
  title: string;
  shortDescription: string;
  thumbnailUrl: string;
  estimatedTime: string;
  xpReward: string;
  passThreshold: string;
}

export interface GrammarLessonFormResult {
  errors: FieldErrors<"title" | "shortDescription" | "thumbnailUrl" | "estimatedTime" | "xpReward" | "passThreshold">;
  values?: {
    topicId: string;
    title: string;
    shortDescription?: string;
    thumbnailUrl?: string;
    estimatedTime?: number;
    order?: number;
    isPublished?: boolean;
    isActive?: boolean;
    xpReward?: number;
    passThreshold?: number;
  };
}

export function validateGrammarLessonForm(
  values: GrammarLessonFormValues & { topicId: string },
): GrammarLessonFormResult {
  const title = values.title.trim();
  const shortDescription = values.shortDescription.trim();
  const thumbnailUrl = values.thumbnailUrl.trim();
  const estimatedTime =
    values.estimatedTime.trim() === ""
      ? undefined
      : Number.parseInt(values.estimatedTime, 10);

  const xpRewardRaw = values.xpReward.trim();
  const xpReward =
    xpRewardRaw === "" ? 10 : Number.parseInt(xpRewardRaw, 10);
  const passThresholdRaw = values.passThreshold.trim();
  const passThreshold =
    passThresholdRaw === "" ? 70 : Number.parseInt(passThresholdRaw, 10);

  const errors: FieldErrors<
    "title" | "shortDescription" | "thumbnailUrl" | "estimatedTime" | "xpReward" | "passThreshold"
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

  if (
    !Number.isInteger(xpReward) ||
    xpReward < 0 ||
    xpReward > 1000
  ) {
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
          topicId: values.topicId,
          title,
          shortDescription: shortDescription || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          estimatedTime,
          xpReward,
          passThreshold,
        },
      };
}
