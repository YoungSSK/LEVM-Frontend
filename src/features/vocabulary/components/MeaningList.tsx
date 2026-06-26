import { Edit2, Trash2 } from "lucide-react";

import type { VocabularyMeaning } from "@/features/vocabulary/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface MeaningListProps {
  meanings: VocabularyMeaning[];
  onEdit: (meaning: VocabularyMeaning) => void;
  onDelete: (meaning: VocabularyMeaning) => void;
}

export default function MeaningList({
  meanings,
  onEdit,
  onDelete,
}: MeaningListProps) {
  if (meanings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center">
        <p className="font-medium text-foreground">Chưa có meaning nào</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Hãy thêm meaning đầu tiên cho word này.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {meanings.map((meaning) => (
        <Card key={meaning._id} className="border-border shadow-sm">
          <CardHeader className="space-y-2 px-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {meaning.partOfSpeech}
                </p>
                <CardTitle className="mt-1 text-lg font-semibold">
                  {meaning.meaning}
                </CardTitle>
              </div>
              <div className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Meaning
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {meaning.example || "Chưa có ví dụ."}
            </p>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(meaning)}
            >
              <Edit2 className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(meaning)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
