import React, { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function ImageUploadInput({
  value,
  onChange,
  label = "Thumbnail ảnh",
  placeholder = "Dán URL ảnh hoặc chọn file từ máy...",
  error,
  disabled = false,
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dung lượng file ảnh tối đa là 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosClient.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.data?.secureUrl) {
        onChange(res.data.data.secureUrl);
        toast.success("Upload ảnh từ máy thành công!");
      } else {
        toast.error("Upload ảnh thất bại!");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Lỗi upload ảnh từ máy";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">Upload file hoặc dán URL</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="pr-8"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 gap-1.5"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {isUploading ? "Đang upload..." : "Tải ảnh từ máy"}
        </Button>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {/* Image Preview */}
      {value.trim() ? (
        <div className="relative mt-2 overflow-hidden rounded-2xl border border-border bg-muted/30">
          <img
            src={value}
            alt="Thumbnail preview"
            className="aspect-[16/9] w-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute right-2 top-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="size-7 rounded-full opacity-90 hover:opacity-100"
              onClick={() => onChange("")}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
