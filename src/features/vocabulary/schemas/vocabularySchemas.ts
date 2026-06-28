import type {
  CreateVocabularyLessonPayload,
  CreateVocabularyMeaningPayload,
  CreateVocabularyTopicPayload,
  CreateVocabularyWordPayload,
  UpdateVocabularyLessonPayload,
  UpdateVocabularyTopicPayload,
  UpdateVocabularyWordPayload,
  AddWordToLessonPayload,
} from "@/features/vocabulary/types";

type FieldErrors<T extends string> = Partial<Record<T, string>>;

export interface TopicFormValues {
  name: string;
  description: string;
  thumbnail: string;
}

export interface TopicFormResult {
  errors: FieldErrors<"name" | "description" | "thumbnail">;
  values?: CreateVocabularyTopicPayload;
}

export function validateTopicForm(values: TopicFormValues): TopicFormResult {
  const name = values.name.trim();
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const errors: FieldErrors<"name" | "description" | "thumbnail"> = {};
  if (!name) {
    errors.name = "Tên topic không được để trống.";
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

export type TopicUpdateFormValues = TopicFormValues;

export interface TopicUpdateFormResult {
  errors: FieldErrors<"name" | "description" | "thumbnail" | "order">;
  values?: UpdateVocabularyTopicPayload;
}

export function validateTopicUpdateForm(
  values: TopicUpdateFormValues,
): TopicUpdateFormResult {
  const result = validateTopicForm(values);

  if (!result.values) {
    return { errors: result.errors };
  }

  return {
    errors: result.errors,
    values: result.values,
  };
}

export interface LessonFormValues {
  title: string;
  description: string;
  thumbnail: string;
  estimatedTime: string;
}

export interface LessonFormResult {
  errors: FieldErrors<
    "topicId" | "title" | "description" | "thumbnail" | "estimatedTime"
  >;
  values?: CreateVocabularyLessonPayload;
}

export function validateLessonForm(
  values: LessonFormValues & { topicId: string },
): LessonFormResult {
  const title = values.title.trim();
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const estimatedTime =
    values.estimatedTime.trim() === ""
      ? undefined
      : Number.parseInt(values.estimatedTime, 10);
  const errors: FieldErrors<
    "topicId" | "title" | "description" | "thumbnail" | "estimatedTime"
  > = {};

  if (!values.topicId.trim()) {
    errors.topicId = "Hãy chọn topic trước khi tạo lesson.";
  }

  if (!title) {
    errors.title = "Tên lesson không được để trống.";
  }

  if (
    estimatedTime !== undefined &&
    (!Number.isInteger(estimatedTime) || estimatedTime < 0)
  ) {
    errors.estimatedTime = "Estimated time phải là số nguyên không âm.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          title,
          description: description || undefined,
          thumbnail: thumbnail || undefined,
          estimatedTime,
        },
      };
}

export interface LessonUpdateFormValues extends LessonFormValues {
  topicId: string;
}

export interface LessonUpdateFormResult {
  errors: FieldErrors<
    "topicId" | "title" | "description" | "thumbnail" | "order"
  >;
  values?: UpdateVocabularyLessonPayload;
}

export function validateLessonUpdateForm(
  values: LessonUpdateFormValues,
): LessonUpdateFormResult {
  const result = validateLessonForm(values);

  if (!result.values) {
    return { errors: result.errors };
  }

  return {
    errors: result.errors,
    values: result.values,
  };
}

export interface MeaningFormValues {
  partOfSpeech: string;
  meaning: string;
  example: string;
}

export interface MeaningFormResult {
  errors: FieldErrors<"partOfSpeech" | "meaning" | "example">;
  values?: Omit<CreateVocabularyMeaningPayload, "wordId">;
}

export function validateMeaningForm(
  values: MeaningFormValues,
): MeaningFormResult {
  const partOfSpeech = values.partOfSpeech.trim();
  const meaning = values.meaning.trim();
  const example = values.example.trim();
  const errors: FieldErrors<"partOfSpeech" | "meaning" | "example"> = {};

  if (!partOfSpeech) {
    errors.partOfSpeech = "Vui lòng nhập từ loại.";
  }

  if (!meaning) {
    errors.meaning = "Vui lòng nhập nghĩa.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          partOfSpeech,
          meaning,
          example: example || undefined,
        },
      };
}

export type MeaningUpdateFormValues = MeaningFormValues;

export interface MeaningUpdateFormResult {
  errors: FieldErrors<"partOfSpeech" | "meaning" | "example">;
  values?: {
    partOfSpeech: string;
    meaning: string;
    example?: string;
  };
}

export function validateMeaningUpdateForm(
  values: MeaningUpdateFormValues,
): MeaningUpdateFormResult {
  const result = validateMeaningForm(values);

  if (!result.values) {
    return { errors: result.errors };
  }

  return {
    errors: result.errors,
    values: result.values,
  };
}

export interface AddWordToLessonFormValues {
  wordId: string;
  meaningId: string;
}

export interface AddWordToLessonFormResult {
  errors: FieldErrors<"wordId" | "meaningId">;
  values?: AddWordToLessonPayload;
}

export function validateAddWordToLessonForm(
  values: AddWordToLessonFormValues & { lessonId: string },
): AddWordToLessonFormResult {
  const errors: FieldErrors<"wordId" | "meaningId"> = {};

  if (!values.wordId.trim()) {
    errors.wordId = "Hãy chọn một word.";
  }

  if (!values.meaningId.trim()) {
    errors.meaningId = "Hãy chọn một meaning.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          lessonId: values.lessonId,
          wordId: values.wordId,
          meaningId: values.meaningId,
        },
      };
}

export interface WordMeaningDraftValues {
  partOfSpeech: string;
  meaning: string;
  example: string;
}

export interface WordCreateFormValues {
  word: string;
  pronunciationUs: string;
  pronunciationUk: string;
  audioUrlUs: string;
  audioUrlUk: string;
  meanings: WordMeaningDraftValues[];
}

export interface WordMeaningDraftErrors {
  partOfSpeech?: string;
  meaning?: string;
  example?: string;
}

export interface WordCreateFormResult {
  errors: FieldErrors<"word" | "meanings"> & {
    meaningErrors?: WordMeaningDraftErrors[];
  };
  values?: CreateVocabularyWordPayload;
}

export function validateWordCreateForm(
  values: WordCreateFormValues,
): WordCreateFormResult {
  const word = values.word.trim();
  const pronunciationUs = values.pronunciationUs.trim();
  const pronunciationUk = values.pronunciationUk.trim();
  const audioUrlUs = values.audioUrlUs.trim();
  const audioUrlUk = values.audioUrlUk.trim();
  const errors: WordCreateFormResult["errors"] = {};
  const meaningErrors: WordMeaningDraftErrors[] = [];
  const meanings = values.meanings.map((item) => ({
    partOfSpeech: item.partOfSpeech.trim(),
    meaning: item.meaning.trim(),
    example: item.example.trim(),
  }));

  if (!word) {
    errors.word = "Word không được để trống.";
  }

  const hasMeaningContent = meanings.some(
    (item) =>
      item.partOfSpeech.length > 0 ||
      item.meaning.length > 0 ||
      item.example.length > 0,
  );

  if (!hasMeaningContent) {
    errors.meanings = "Hãy thêm ít nhất một meaning.";
  }

  meanings.forEach((meaningItem, index) => {
    const itemErrors: WordMeaningDraftErrors = {};

    if (
      !meaningItem.partOfSpeech &&
      !meaningItem.meaning &&
      !meaningItem.example
    ) {
      meaningErrors[index] = itemErrors;
      return;
    }

    if (!meaningItem.partOfSpeech) {
      itemErrors.partOfSpeech = "Thiếu từ loại.";
    }

    if (!meaningItem.meaning) {
      itemErrors.meaning = "Thiếu nghĩa.";
    }

    meaningErrors[index] = itemErrors;
  });

  const hasMeaningErrors = meaningErrors.some(
    (item) =>
      Boolean(item.partOfSpeech) ||
      Boolean(item.meaning) ||
      Boolean(item.example),
  );

  if (hasMeaningErrors) {
    errors.meaningErrors = meaningErrors;
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          word,
          pronunciations:
            pronunciationUs || pronunciationUk
              ? {
                  us: pronunciationUs || undefined,
                  uk: pronunciationUk || undefined,
                }
              : undefined,
          audioUrls:
            audioUrlUs || audioUrlUk
              ? {
                  us: audioUrlUs || undefined,
                  uk: audioUrlUk || undefined,
                }
              : undefined,
          meanings: meanings
            .filter(
              (item) =>
                item.partOfSpeech.length > 0 ||
                item.meaning.length > 0 ||
                item.example.length > 0,
            )
            .map((item) => ({
              partOfSpeech: item.partOfSpeech,
              meaning: item.meaning,
              exampleSentence: item.example || undefined,
            })),
        },
      };
}

export interface WordUpdateFormValues {
  word: string;
  pronunciationUs: string;
  pronunciationUk: string;
  audioUrlUs: string;
  audioUrlUk: string;
}

export interface WordUpdateFormResult {
  errors: FieldErrors<"word" | "phonetic" | "audioUrl">;
  values?: UpdateVocabularyWordPayload;
}

export function validateWordUpdateForm(
  values: WordUpdateFormValues,
): WordUpdateFormResult {
  const word = values.word.trim();
  const pronunciationUs = values.pronunciationUs.trim();
  const pronunciationUk = values.pronunciationUk.trim();
  const audioUrlUs = values.audioUrlUs.trim();
  const audioUrlUk = values.audioUrlUk.trim();
  const errors: FieldErrors<"word"> = {};
  if (!word) {
    errors.word = "Word không được để trống.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          word,
          pronunciations:
            pronunciationUs || pronunciationUk
              ? {
                  us: pronunciationUs || undefined,
                  uk: pronunciationUk || undefined,
                }
              : undefined,
          audioUrls:
            audioUrlUs || audioUrlUk
              ? {
                  us: audioUrlUs || undefined,
                  uk: audioUrlUk || undefined,
                }
              : undefined,
        },
      };
}
