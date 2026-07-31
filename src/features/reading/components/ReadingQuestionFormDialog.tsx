import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  ReadingQuestion,
  ReadingQuestionType,
  QuestionOption,
  MatchingItem,
  CorrectMatch,
} from "@/api/readingQuestionApi";

interface ReadingQuestionFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  question: ReadingQuestion | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    questionText: string;
    questionType: ReadingQuestionType;
    contextText?: string;
    locationInPassage?: string;
    explanation?: string;
    points?: number;
    options?: QuestionOption[];
    leftItems?: MatchingItem[];
    rightItems?: MatchingItem[];
    correctMatches?: CorrectMatch[];
    correctAnswer?: string | string[] | null;
    wordLimit?: number | null;
    caseSensitive?: boolean;
  }) => Promise<void>;
}

const QUESTION_TYPE_LABELS: Record<ReadingQuestionType, string> = {
  multiple_choice: "Multiple Choice (1 đáp án đúng)",
  multiple_answer: "Multiple Answer (Nhiều đáp án đúng)",
  true_false: "True / False",
  true_false_not_given: "True / False / Not Given (IELTS)",
  yes_no_not_given: "Yes / No / Not Given (IELTS)",
  matching_heading: "Matching Headings",
  matching_information: "Matching Information",
  matching_feature: "Matching Features",
  matching_sentence_ending: "Matching Sentence Endings",
  sentence_completion: "Sentence Completion",
  summary_completion: "Summary Completion",
  note_completion: "Note Completion",
  table_completion: "Table Completion",
  flow_chart_completion: "Flow Chart Completion",
  diagram_completion: "Diagram Completion",
  short_answer: "Short Answer",
  fill_in_blank: "Fill in Blank",
};

export default function ReadingQuestionFormDialog({
  open,
  mode,
  question,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ReadingQuestionFormDialogProps) {
  const [questionType, setQuestionType] = useState<ReadingQuestionType>(
    question?.questionType ?? "multiple_choice",
  );
  const [questionText, setQuestionText] = useState(question?.questionText ?? "");
  const [contextText, setContextText] = useState(question?.contextText ?? "");
  const [locationInPassage, setLocationInPassage] = useState(
    question?.locationInPassage ?? "",
  );
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [points, setPoints] = useState(String(question?.points ?? 1));

  // Multiple Choice / Answer state
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options && question.options.length > 0
      ? question.options
      : [
          { key: "A", text: "", isCorrect: true },
          { key: "B", text: "", isCorrect: false },
          { key: "C", text: "", isCorrect: false },
          { key: "D", text: "", isCorrect: false },
        ],
  );

  // True/False state
  const [tfAnswer, setTfAnswer] = useState<string>(
    typeof question?.correctAnswer === "string" ? question.correctAnswer : "True",
  );

  // Completion / Short answer state
  const [textAnswer, setTextAnswer] = useState<string>(
    Array.isArray(question?.correctAnswer)
      ? question.correctAnswer.join("; ")
      : typeof question?.correctAnswer === "string"
        ? question.correctAnswer
        : "",
  );
  const [wordLimit, setWordLimit] = useState(
    question?.wordLimit ? String(question.wordLimit) : "",
  );

  // Matching state
  const [leftItems] = useState<MatchingItem[]>(
    question?.leftItems && question.leftItems.length > 0
      ? question.leftItems
      : [
          { id: "A", text: "Paragraph A" },
          { id: "B", text: "Paragraph B" },
        ],
  );
  const [rightItems] = useState<MatchingItem[]>(
    question?.rightItems && question.rightItems.length > 0
      ? question.rightItems
      : [
          { id: "1", text: "Heading 1" },
          { id: "2", text: "Heading 2" },
        ],
  );
  const [correctMatches] = useState<CorrectMatch[]>(
    question?.correctMatches ?? [],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddOption = () => {
    const nextKey = String.fromCharCode(65 + options.length);
    setOptions([...options, { key: nextKey, text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOpts = options.filter((_, i) => i !== index);
    setOptions(newOpts.map((opt, i) => ({ ...opt, key: String.fromCharCode(65 + i) })));
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOpts = [...options];
    newOpts[index].text = text;
    setOptions(newOpts);
  };

  const handleOptionRadioChange = (index: number) => {
    if (questionType === "multiple_choice") {
      setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === index })));
    } else {
      const newOpts = [...options];
      newOpts[index].isCorrect = !newOpts[index].isCorrect;
      setOptions(newOpts);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setErrors({ questionText: "Nội dung câu hỏi không được để trống." });
      return;
    }

    setErrors({});

    const payload: {
      questionText: string;
      questionType: ReadingQuestionType;
      contextText?: string;
      locationInPassage?: string;
      explanation?: string;
      points?: number;
      options?: QuestionOption[];
      leftItems?: MatchingItem[];
      rightItems?: MatchingItem[];
      correctMatches?: CorrectMatch[];
      correctAnswer?: string | string[] | null;
      wordLimit?: number | null;
    } = {
      questionText: questionText.trim(),
      questionType,
      contextText: contextText.trim() || undefined,
      locationInPassage: locationInPassage.trim() || undefined,
      explanation: explanation.trim() || undefined,
      points: Number(points) || 1,
    };

    if (["multiple_choice", "multiple_answer"].includes(questionType)) {
      payload.options = options;
    } else if (
      ["true_false", "true_false_not_given", "yes_no_not_given"].includes(questionType)
    ) {
      payload.correctAnswer = tfAnswer;
    } else if (
      [
        "matching_heading",
        "matching_information",
        "matching_feature",
        "matching_sentence_ending",
      ].includes(questionType)
    ) {
      payload.leftItems = leftItems;
      payload.rightItems = rightItems;
      payload.correctMatches = correctMatches;
    } else {
      const answers = textAnswer
        .split(";")
        .map((a) => a.trim())
        .filter(Boolean);
      payload.correctAnswer = answers.length === 1 ? answers[0] : answers;
      payload.wordLimit = wordLimit ? Number(wordLimit) : null;
    }

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm câu hỏi mới" : "Chỉnh sửa câu hỏi"}
          </DialogTitle>
          <DialogDescription>
            Hỗ trợ 16 loại câu hỏi đọc hiểu chuẩn IELTS / TOEIC.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Question Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Loại câu hỏi <span className="text-destructive">*</span>
            </label>
            <Select
              value={questionType}
              onValueChange={(val) => setQuestionType(val as ReadingQuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Nội dung câu hỏi <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập đề bài câu hỏi..."
              rows={3}
            />
            {errors.questionText ? (
              <p className="text-xs text-destructive">{errors.questionText}</p>
            ) : null}
          </div>

          {/* Context Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Ngữ cảnh / Đoạn văn phụ (tùy chọn)
            </label>
            <Textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Văn bản bổ sung cho câu hỏi nếu có..."
              rows={2}
            />
          </div>

          {/* Multiple Choice / Multiple Answer */}
          {["multiple_choice", "multiple_answer"].includes(questionType) && (
            <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  Danh sách Lựa chọn (Đánh dấu tích vào đáp án đúng)
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddOption}
                  className="h-7 text-xs"
                >
                  <Plus className="mr-1 size-3" /> Thêm option
                </Button>
              </div>

              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type={questionType === "multiple_choice" ? "radio" : "checkbox"}
                    name="correct-option"
                    checked={opt.isCorrect}
                    onChange={() => handleOptionRadioChange(idx)}
                    className="size-4 text-primary"
                  />
                  <span className="w-5 text-center text-xs font-bold">{opt.key}</span>
                  <Input
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Lựa chọn ${opt.key}...`}
                    className="text-sm"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive"
                      onClick={() => handleRemoveOption(idx)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* True / False / Not Given */}
          {["true_false", "true_false_not_given", "yes_no_not_given"].includes(
            questionType,
          ) && (
            <div className="space-y-2 rounded-2xl border border-border bg-muted/20 p-3">
              <label className="text-xs font-semibold text-foreground">
                Đáp án đúng
              </label>
              <Select value={tfAnswer} onValueChange={setTfAnswer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionType === "true_false" && (
                    <>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                    </>
                  )}
                  {questionType === "true_false_not_given" && (
                    <>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                      <SelectItem value="Not Given">Not Given</SelectItem>
                    </>
                  )}
                  {questionType === "yes_no_not_given" && (
                    <>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Not Given">Not Given</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Completion / Fill in Blank / Short Answer */}
          {[
            "sentence_completion",
            "summary_completion",
            "note_completion",
            "table_completion",
            "flow_chart_completion",
            "diagram_completion",
            "short_answer",
            "fill_in_blank",
          ].includes(questionType) && (
            <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Đáp án đúng (Phân cách các đáp án đồng nghĩa bằng dấu chấm phẩy ;)
                </label>
                <Input
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Ví dụ: three months; 3 months"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Giới hạn số từ (Word Limit - tùy chọn)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={wordLimit}
                  onChange={(e) => setWordLimit(e.target.value)}
                  placeholder="Ví dụ: NO MORE THAN TWO WORDS"
                />
              </div>
            </div>
          )}

          {/* Location & Explanation & Points */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Vị trí trong bài đọc
              </label>
              <Input
                value={locationInPassage}
                onChange={(e) => setLocationInPassage(e.target.value)}
                placeholder="Ví dụ: Paragraph A, Line 12"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Điểm số (Points)
              </label>
              <Input
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Giải thích đáp án (Explanation)
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích lý do đáp án đúng..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang lưu..."
                : mode === "create"
                  ? "Thêm câu hỏi"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
