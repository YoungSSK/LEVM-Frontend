export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi hệ thống, vui lòng thử lại sau.";
}

function getSortableLabel(item: {
  name?: string;
  title?: string;
  word?: string;
}) {
  return item.name ?? item.title ?? item.word ?? "";
}

export function sortByOrderThenLabel<
  T extends { order?: number; name?: string; title?: string; word?: string },
>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderDelta = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);

    if (orderDelta !== 0) {
      return orderDelta;
    }

    return getSortableLabel(a).localeCompare(getSortableLabel(b));
  });
}

export function sortWordsByLabel<T extends { word: string }>(items: T[]) {
  return [...items].sort((a, b) => a.word.localeCompare(b.word));
}

export function sortLessonRelations<T extends {
  word?: { word?: string };
  meaning?: { meaning?: string };
}>(items: T[]) {
  return [...items].sort((a, b) => {
    const wordDelta = (a.word?.word ?? "").localeCompare(b.word?.word ?? "");

    if (wordDelta !== 0) {
      return wordDelta;
    }

    return (a.meaning?.meaning ?? "").localeCompare(b.meaning?.meaning ?? "");
  });
}
