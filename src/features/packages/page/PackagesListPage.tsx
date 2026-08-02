import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { usePackageStore } from "@/stores/PackageStore";
import type { Package as PackageType, CreatePackagePayload } from "@/api/packageApi";

// ── Form Dialog ───────────────────────────────────────────────────────────────

interface PackageFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  pkg: PackageType | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreatePackagePayload) => Promise<void>;
}

function PackageFormDialog({
  open,
  mode,
  pkg,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: PackageFormDialogProps) {
  const [name, setName] = useState(pkg?.name ?? "");
  const [slug, setSlug] = useState(pkg?.slug ?? "");
  const [level, setLevel] = useState(String(pkg?.level ?? 1));
  const [price, setPrice] = useState(String(pkg?.price ?? 0));
  const [durationInDays, setDurationInDays] = useState(
    pkg?.durationInDays ? String(pkg.durationInDays) : "",
  );
  const [description, setDescription] = useState(pkg?.description ?? "");
  const [features, setFeatures] = useState((pkg?.features ?? []).join("\n"));

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setSlug(pkg.slug);
      setLevel(String(pkg.level));
      setPrice(String(pkg.price));
      setDurationInDays(pkg.durationInDays ? String(pkg.durationInDays) : "");
      setDescription(pkg.description);
      setFeatures((pkg.features ?? []).join("\n"));
    } else {
      setName(""); setSlug(""); setLevel("1"); setPrice("0");
      setDurationInDays(""); setDescription(""); setFeatures("");
    }
  }, [pkg, open]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (mode === "create") {
      setSlug(
        v.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Vui lòng nhập tên và slug gói");
      return;
    }
    await onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      level: Number(level) || 1,
      price: Number(price) || 0,
      durationInDays: durationInDays ? Number(durationInDays) : null,
      description: description.trim(),
      features: features.split("\n").map((f) => f.trim()).filter(Boolean),
    });
  };

  const isFree = pkg?.slug === "free";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {mode === "create" ? "Tạo gói thành viên mới" : "Chỉnh sửa gói"}
          </DialogTitle>
          <DialogDescription>
            Gói được gán cho từng bài học — user phải có gói mới xem được nội dung.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tên gói *</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: VIP Tháng, VIP Năm..."
              disabled={isSubmitting || isFree}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vip-monthly"
                disabled={isSubmitting || isFree}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Cấp độ (level)</label>
              <Input
                type="number"
                min={0}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isSubmitting || isFree}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Giá (VND)</label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting || isFree}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Thời hạn (ngày){" "}
                <span className="text-xs text-muted-foreground font-normal">để trống = vĩnh viễn</span>
              </label>
              <Input
                type="number"
                min={1}
                value={durationInDays}
                onChange={(e) => setDurationInDays(e.target.value)}
                placeholder="30"
                disabled={isSubmitting || isFree}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mô tả ngắn</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={isSubmitting || isFree}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Tính năng / Quyền lợi{" "}
              <span className="text-xs text-muted-foreground font-normal">(mỗi dòng 1 mục)</span>
            </label>
            <Textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={4}
              placeholder={"Truy cập tất cả bài học VIP\nXem video bài giảng\n..."}
              disabled={isSubmitting || isFree}
            />
          </div>
          {isFree && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠ Gói Free là gói mặc định của hệ thống — không thể chỉnh sửa nội dung.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting || isFree}>
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo gói" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Sub-page ─────────────────────────────────────────────────────────────

export default function PackagesListPage() {
  const { packages, isLoading, fetchAll, create, update, remove } = usePackageStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PackageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAll(true).catch(() => toast.error("Không tải được danh sách gói"));
  }, []);

  const handleCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleEdit = (pkg: PackageType) => {
    setEditTarget(pkg);
    setDialogOpen(true);
  };

  const handleDelete = async (pkg: PackageType) => {
    if (pkg.slug === "free") { toast.error("Không thể xoá gói Free"); return; }
    if (!confirm(`Xoá gói "${pkg.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await remove(pkg._id);
      toast.success("Đã xoá gói thành viên");
    } catch {
      toast.error("Xoá gói thất bại");
    }
  };

  const handleSubmit = async (payload: CreatePackagePayload) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await update(editTarget._id, payload);
        toast.success("Cập nhật gói thành công");
      } else {
        await create(payload);
        toast.success("Tạo gói thành công");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}₫`;

  const formatDuration = (days: number | null) => {
    if (!days) return "Vĩnh viễn";
    if (days === 30) return "1 tháng";
    if (days === 90) return "3 tháng";
    if (days === 365) return "1 năm";
    return `${days} ngày`;
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Danh sách Gói Thành viên ({packages.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Các gói được hiển thị cho người dùng lựa chọn nâng cấp và dùng để gán quyền bài học.
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo gói mới
        </Button>
      </div>

      {/* Table Card */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground rounded-2xl border border-border bg-card">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
          Đang tải danh sách gói...
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tên gói</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cấp độ</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Giá</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Thời hạn</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, i) => (
                <tr key={pkg._id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{pkg.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{pkg.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-semibold">
                      Lv.{pkg.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatPrice(pkg.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {pkg.durationInDays
                      ? formatDuration(pkg.durationInDays)
                      : <span className="flex items-center gap-1"><Infinity className="h-3 w-3 inline text-primary" /> Vĩnh viễn</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? "Hoạt động" : "Đã ẩn"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(pkg)} className="h-8 w-8" title="Chỉnh sửa">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        onClick={() => handleDelete(pkg)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Xoá" disabled={pkg.slug === "free"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Chưa có gói thành viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <PackageFormDialog
        open={dialogOpen}
        mode={editTarget ? "edit" : "create"}
        pkg={editTarget}
        isSubmitting={isSubmitting}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
