import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";

import type { VocabularyWord } from "@/features/vocabulary/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { vocabularyRoutePaths } from "@/features/vocabulary/routes/vocabularyRoutes";

interface WordCardProps {
  word: VocabularyWord;
  firstMeaning?: string;
  onEdit: (word: VocabularyWord) => void;
  onDelete: (word: VocabularyWord) => void;
}

export default function WordCard({
  word,
  firstMeaning,
  onEdit,
  onDelete,
}: WordCardProps) {
  const previewMeaning =
    word.meaningPreview ?? firstMeaning ?? word.meanings?.[0]?.meaning ?? "";

  return (
    <Card className="card-hover h-full border-border shadow-sm transition-all">
      <CardHeader className="space-y-2 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg font-semibold">
              {word.word}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {word.phonetic || "Chưa có phonetic."}
            </p>
          </div>
          <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Word
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5">
        <div className="rounded-2xl bg-muted/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            First Meaning
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">
            {previewMeaning || "Chưa có nghĩa."}
          </p>
        </div>

        {word.audioUrl ? (
          <audio controls src={word.audioUrl} className="w-full" />
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có audio.</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 px-5 py-4">
        <Button asChild variant="outline" size="sm">
          <Link to={vocabularyRoutePaths.wordDetail(word._id)}>View</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(word)}
        >
          <Edit2 className="size-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(word)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
