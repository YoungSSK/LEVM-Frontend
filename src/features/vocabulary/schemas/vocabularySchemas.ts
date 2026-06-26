import type {
  CreateVocabularyLessonPayload,
  CreateVocabularyMeaningPayload,
  CreateVocabularyTopicPayload,
  CreateVocabularyWordMeaningPayload,
  CreateVocabularyWordPayload,
  UpdateVocabularyLessonPayload,
  UpdateVocabularyTopicPayload,
  UpdateVocabularyWordPayload,
  AddWordToLessonPayload,
} from "@/features/vocabulary/types";

type FieldErrors<T extends string> = Partial<Record<T, string>>;

function parseOrder(value: string) {
  if (value.trim() === "") return Number.NaN;
  return Number.parseInt(value, 10);
}

function isValidInteger(value: number) {
  return Number.isInteger(value) && value >= 0;
}

export interface TopicFormValues {
  name: string;
  description: string;
  thumbnail: string;
  order: string;
  isActive: boolean;
}

export interface TopicFormResult {
  errors: FieldErrors<"name" | "description" | "thumbnail" | "order">;
  values?: CreateVocabularyTopicPayload;
}

export function validateTopicForm(values: TopicFormValues): TopicFormResult {
  const name = values.name.trim();
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const order = parseOrder(values.order);
  const errors: FieldErrors<"name" | "description" | "thumbnail" | "order"> = {};

  if (!name) {
    errors.name = "Tên topic không được để trống.";
  }

  if (!isValidInteger(order)) {
    errors.order = "Order phải là số nguyên không âm.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          name,
          description: description || undefined,
          thumbnail: thumbnail || undefined,
          order,
          isActive: values.isActive,
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
  order: string;
  isPublished: boolean;
}

export interface LessonFormResult {
  errors: FieldErrors<
    "topicId" | "title" | "description" | "thumbnail" | "order"
  >;
  values?: CreateVocabularyLessonPayload;
}

export function validateLessonForm(
  values: LessonFormValues & { topicId: string },
): LessonFormResult {
  const title = values.title.trim();
  const description = values.description.trim();
  const thumbnail = values.thumbnail.trim();
  const order = parseOrder(values.order);
  const errors: FieldErrors<
    "topicId" | "title" | "description" | "thumbnail" | "order"
  > = {};

  if (!values.topicId.trim()) {
    errors.topicId = "Hãy chọn topic trước khi tạo lesson.";
  }

  if (!title) {
    errors.title = "Tên lesson không được để trống.";
  }

  if (!isValidInteger(order)) {
    errors.order = "Order phải là số nguyên không âm.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          topicId: values.topicId,
          title,
          description: description || undefined,
          thumbnail: thumbnail || undefined,
          order,
          isPublished: values.isPublished,
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
  phonetic: string;
  audioUrl: string;
  meanings: WordMeaningDraftValues[];
}

export interface WordMeaningDraftErrors {
  partOfSpeech?: string;
  meaning?: string;
  example?: string;
}

export interface WordCreateFormResult {
  errors: FieldErrors<"word" | "phonetic" | "audioUrl" | "meanings"> & {
    meaningErrors?: WordMeaningDraftErrors[];
  };
  values?: CreateVocabularyWordPayload;
}

export function validateWordCreateForm(
  values: WordCreateFormValues,
): WordCreateFormResult {
  const word = values.word.trim();
  const phonetic = values.phonetic.trim();
  const audioUrl = values.audioUrl.trim();
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
          phonetic: phonetic || undefined,
          audioUrl: audioUrl || undefined,
          meanings: meanings
            .filter(
              (item) =>
                item.partOfSpeech.length > 0 ||
                item.meaning.length > 0 ||
                item.example.length > 0,
            )
            .map(
              (item): CreateVocabularyWordMeaningPayload => ({
                partOfSpeech: item.partOfSpeech,
                meaning: item.meaning,
                example: item.example || undefined,
              }),
            ),
        },
      };
}

export interface WordUpdateFormValues {
  word: string;
  phonetic: string;
  audioUrl: string;
}

export interface WordUpdateFormResult {
  errors: FieldErrors<"word" | "phonetic" | "audioUrl">;
  values?: UpdateVocabularyWordPayload;
}

export function validateWordUpdateForm(
  values: WordUpdateFormValues,
): WordUpdateFormResult {
  const word = values.word.trim();
  const phonetic = values.phonetic.trim();
  const audioUrl = values.audioUrl.trim();
  const errors: FieldErrors<"word" | "phonetic" | "audioUrl"> = {};

  if (!word) {
    errors.word = "Word không được để trống.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : {
        errors,
        values: {
          word,
          phonetic: phonetic || undefined,
          audioUrl: audioUrl || undefined,
        },
      };
}
