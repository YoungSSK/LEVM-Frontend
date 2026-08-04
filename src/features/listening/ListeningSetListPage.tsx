import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Headphones,
  Plus,
  Search,
  Filter,
  Volume2,
  FileQuestion,
  Loader2,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import listeningApi, { type ListeningSet } from "@/api/listeningApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PackageAccessSelector from "@/components/PackageAccessSelector";

export default function ListeningSetListPage() {
  const navigate = useNavigate();
  const [sets, setSets] = useState<ListeningSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Create Set Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [part, setPart] = useState<1 | 2 | 3 | 4>(1);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [xpReward, setXpReward] = useState(15);
  const [passThreshold, setPassThreshold] = useState(70);
  const [allowedPackageIds, setAllowedPackageIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Set Modal state
  const [editingSet, setEditingSet] = useState<ListeningSet | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPart, setEditPart] = useState<1 | 2 | 3 | 4>(1);
  const [editDifficulty, setEditDifficulty] = useState("intermediate");
  const [editStatus, setEditStatus] = useState<"draft" | "published" | "archived">("draft");
  const [editXpReward, setEditXpReward] = useState(15);
  const [editPassThreshold, setEditPassThreshold] = useState(70);
  const [editAllowedPackageIds, setEditAllowedPackageIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedPart !== "all") params.part = selectedPart;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const res = await listeningApi.getSets(params);
      setSets(res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tải danh sách bài nghe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [selectedPart, selectedStatus]);

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài nghe");
      return;
    }

    try {
      setIsSubmitting(true);
      const newSet = await listeningApi.createSet({
        title,
        part,
        difficulty,
        xpReward: Number(xpReward),
        passThreshold: Number(passThreshold),
        allowedPackageIds,
        status: "draft",
      });
      toast.success("Tạo bài nghe thành công! Đang chuyển đến trang chi tiết...");
      setIsModalOpen(false);
      setTitle("");
      setAllowedPackageIds([]);
      if (newSet && newSet._id) {
        navigate(`/listening/sets/${newSet._id}`);
      } else {
        fetchSets();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tạo bài nghe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (set: ListeningSet) => {
    setEditingSet(set);
    setEditTitle(set.title);
    setEditPart(set.part as any);
    setEditDifficulty(set.difficulty || "intermediate");
    setEditStatus(set.status || "draft");
    setEditXpReward(set.xpReward || 15);
    setEditPassThreshold(set.passThreshold || 70);

    const rawPackageIds = set.allowedPackageIds || [];
    const stringPackageIds = rawPackageIds
      .map((item: any) => (typeof item === "string" ? item : (item && item._id) || item.id || ""))
      .filter((id: string) => typeof id === "string" && id.length === 24);
    setEditAllowedPackageIds(stringPackageIds);
  };

  const handleUpdateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) return;
    if (!editTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài nghe");
      return;
    }

    try {
      setIsUpdating(true);
      await listeningApi.updateSet(editingSet._id, {
        title: editTitle,
        part: editPart,
        difficulty: editDifficulty,
        status: editStatus,
        xpReward: Number(editXpReward),
        passThreshold: Number(editPassThreshold),
        allowedPackageIds: editAllowedPackageIds,
      });
      toast.success("Cập nhật bài nghe thành công!");
      setEditingSet(null);
      fetchSets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật bài nghe");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSet = async (id: string, setPart: number) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài nghe Part ${setPart} này?`)) return;
    try {
      await listeningApi.deleteSet(id);
      toast.success("Đã xóa bài nghe");
      fetchSets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xóa bài nghe");
    }
  };

  const filteredSets = sets.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground">
            <Headphones className="size-7 text-primary" />
            Quản Lý Bài Luyện Nghe TOEIC
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo và quản lý các đề luyện nghe TOEIC Listening Part 1, 2, 3 và 4.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
          <Plus className="size-4" />
          Tạo bài nghe mới
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        {/* Part Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedPart("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedPart === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Tất cả Part
          </button>
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPart(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedPart === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Part {p}
            </button>
          ))}
        </div>

        {/* Search Input & Status Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài nghe..."
              className="pl-9 text-xs"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Published (Đã xuất bản)</option>
            <option value="draft">Draft (Bản nháp)</option>
            <option value="archived">Archived (Lưu trữ)</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <Volume2 className="mx-auto size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Không tìm thấy bài nghe nào</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc tạo thêm bài nghe mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSets.map((set) => (
            <div
              key={set._id}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    TOEIC Part {set.part}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      set.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : set.status === "archived"
                        ? "bg-muted text-muted-foreground"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {set.status}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {set.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="size-3.5" />
                    {set.questionCount || 0} câu hỏi
                  </span>
                  <span>•</span>
                  <span>XP: +{set.xpReward}</span>
                  <span>•</span>
                  <span>Đạt: {set.passThreshold}%</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(set.createdAt).toLocaleDateString("vi-VN")}
                </span>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" asChild className="h-8 gap-1 text-xs">
                    <Link to={`/listening/sets/${set._id}`}>
                      <Eye className="size-3.5" />
                      Chi tiết
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(set)}
                    className="h-8 gap-1 text-xs text-primary"
                  >
                    <Edit className="size-3.5" />
                    Sửa
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSet(set._id, set.part)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Set */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Tạo bài nghe TOEIC mới</h3>

            <form onSubmit={handleCreateSet} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Tiêu đề bài nghe</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: TOEIC Listening Part 1 - Test 01"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Chọn Part</label>
                  <select
                    value={part}
                    onChange={(e) => setPart(Number(e.target.value) as any)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={1}>Part 1 (Mô tả ảnh)</option>
                    <option value={2}>Part 2 (Hỏi - Đáp)</option>
                    <option value={3}>Part 3 (Hội thoại ngắn)</option>
                    <option value={4}>Part 4 (Bài nói ngắn)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Độ khó</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">XP Thưởng</label>
                  <Input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Ngưỡng đạt (%)</label>
                  <Input
                    type="number"
                    value={passThreshold}
                    onChange={(e) => setPassThreshold(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <PackageAccessSelector
                value={allowedPackageIds}
                onChange={setAllowedPackageIds}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Tạo bài nghe
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Set */}
      {editingSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground">Chỉnh sửa bài nghe TOEIC</h3>

            <form onSubmit={handleUpdateSet} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Tiêu đề bài nghe</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ví dụ: TOEIC Listening Part 1 - Test 01"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Part</label>
                  <select
                    value={editPart}
                    onChange={(e) => setEditPart(Number(e.target.value) as any)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={1}>Part 1</option>
                    <option value={2}>Part 2</option>
                    <option value={3}>Part 3</option>
                    <option value={4}>Part 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Trạng thái</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Độ khó</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">XP Thưởng</label>
                  <Input
                    type="number"
                    value={editXpReward}
                    onChange={(e) => setEditXpReward(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Ngưỡng đạt (%)</label>
                  <Input
                    type="number"
                    value={editPassThreshold}
                    onChange={(e) => setEditPassThreshold(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <PackageAccessSelector
                value={editAllowedPackageIds}
                onChange={setEditAllowedPackageIds}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingSet(null)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
