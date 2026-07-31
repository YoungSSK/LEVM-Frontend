import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import readingPassageApi from "@/api/readingPassageApi";
import type { DocxPreviewResult } from "@/api/readingCategoryApi";

interface ReadingDocxUploadButtonProps {
  passageId?: string;
  onPreviewSuccess?: (result: DocxPreviewResult) => void;
  onUploadSuccess?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

export default function ReadingDocxUploadButton({
  passageId,
  onPreviewSuccess,
  onUploadSuccess,
  variant = "outline",
  size = "sm",
  label,
}: ReadingDocxUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".docx") &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error("Vui lòng chọn file DOCX (.docx)");
      return;
    }

    setIsUploading(true);

    try {
      if (passageId) {
        // Direct upload & update to existing passage
        await readingPassageApi.updateFromDocument(passageId, file);
        toast.success("Upload & cập nhật nội dung từ DOCX thành công!");
        onUploadSuccess?.();
      } else {
        // Preview only
        const result = await readingPassageApi.previewDocument(file);
        toast.success(
          `Parse file thành công! (${result.wordCount} từ${result.warnings.length > 0 ? `, ${result.warnings.length} cảnh báo` : ""})`,
        );
        onPreviewSuccess?.(result);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || "Upload file thất bại";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
        ) : (
          <Upload className="mr-1.5 size-3.5" />
        )}
        {label || (isUploading ? "Đang xử lý..." : "Upload file DOCX")}
      </Button>
    </>
  );
}
