import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import readingQuestionApi from "@/api/readingQuestionApi";
import type { CsvPreviewResult } from "@/api/readingQuestionApi";

interface ReadingCsvImportModalProps {
  open: boolean;
  setId: string;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

export default function ReadingCsvImportModal({
  open,
  setId,
  onOpenChange,
  onImportSuccess,
}: ReadingCsvImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewResult, setPreviewResult] = useState<CsvPreviewResult | null>(null);

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsPreviewing(true);
    setPreviewResult(null);

    try {
      const result = await readingQuestionApi.previewCsv(setId, file);
      setPreviewResult(result);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || "Lỗi parse file CSV";
      toast.error(msg);
      setSelectedFile(null);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);

    try {
      const result = await readingQuestionApi.importCsv(setId, selectedFile);
      if (result.inserted > 0) {
        toast.success(`Đã import thành công ${result.inserted} câu hỏi!`);
        onImportSuccess();
        onOpenChange(false);
      } else {
        toast.error("Import thất bại. Vui lòng sửa lại các dòng lỗi trong file CSV.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || "Lỗi import CSV";
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import câu hỏi từ file CSV</DialogTitle>
          <DialogDescription>
            Tải lên file CSV chứa danh sách câu hỏi đọc hiểu. Hệ thống sẽ kiểm tra và hiển thị bản xem trước.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* File Picker */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <FileText className="size-8 text-primary/70" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selectedFile ? selectedFile.name : "Chọn file CSV từ máy tính"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ UTF-8, CSV theo định dạng chuẩn LEVM Reading.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleSelectFile}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPreviewing || isImporting}
            >
              <Upload className="mr-1.5 size-3.5" />
              {selectedFile ? "Đổi file" : "Chọn file"}
            </Button>
          </div>

          {/* Loading Preview state */}
          {isPreviewing && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              Đang phân tích file CSV...
            </div>
          )}

          {/* Preview Results Table */}
          {previewResult && !isPreviewing && (
            <div className="space-y-3">
              {/* Stats Bar */}
              <div className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    Tổng số dòng: {previewResult.total}
                  </span>
                  <Badge variant="default" className="bg-emerald-500/15 text-emerald-600">
                    <CheckCircle className="mr-1 size-3" />
                    {previewResult.validCount} hợp lệ
                  </Badge>
                  {previewResult.errorCount > 0 && (
                    <Badge variant="destructive" className="bg-destructive/15 text-destructive">
                      <AlertTriangle className="mr-1 size-3" />
                      {previewResult.errorCount} lỗi
                    </Badge>
                  )}
                </div>
              </div>

              {/* Errors List */}
              {previewResult.errors.length > 0 && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive space-y-1 max-h-36 overflow-y-auto">
                  <p className="font-semibold">Danh sách lỗi phát hiện trong CSV:</p>
                  {previewResult.errors.map((err, idx) => (
                    <p key={idx}>
                      • Dòng {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              )}

              {/* Valid Items Preview Table */}
              {previewResult.valid.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-muted border-b border-border font-medium text-muted-foreground">
                        <tr>
                          <th className="p-2.5 w-12 text-center">Row</th>
                          <th className="p-2.5 w-36">Type</th>
                          <th className="p-2.5">Question Text</th>
                          <th className="p-2.5 w-24">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {previewResult.valid.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-2.5 text-center font-mono text-muted-foreground">
                              {item.row}
                            </td>
                            <td className="p-2.5 font-medium text-foreground">
                              {item.data.questionType}
                            </td>
                            <td className="p-2.5 text-foreground line-clamp-1">
                              {item.data.questionText}
                            </td>
                            <td className="p-2.5 text-muted-foreground">
                              {item.data.locationInPassage || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={
              !previewResult ||
              previewResult.validCount === 0 ||
              previewResult.errorCount > 0 ||
              isImporting
            }
            onClick={handleConfirmImport}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang import...
              </>
            ) : (
              `Import ${previewResult?.validCount || 0} câu hỏi`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
