import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Filter, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscriptionApi } from "@/api/packageApi";
import type { Subscription } from "@/api/packageApi";

const STATUS_LABELS: Record<Subscription["status"], string> = {
  active: "Đang active",
  expired: "Hết hạn",
  cancelled: "Đã huỷ",
  pending_payment: "Chờ thanh toán",
};

const STATUS_VARIANTS: Record<
  Subscription["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  expired: "secondary",
  cancelled: "destructive",
  pending_payment: "outline",
};

export default function SubscriptionsListPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await subscriptionApi.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        limit: LIMIT,
      });
      setSubscriptions(result.subscriptions);
      setTotal(result.total);
    } catch {
      toast.error("Không tải được danh sách subscription");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [statusFilter, page]);

  const filteredSubs = subscriptions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.userId?.email?.toLowerCase().includes(q) ||
      s.userId?.username?.toLowerCase().includes(q) ||
      s.userId?.displayName?.toLowerCase().includes(q)
    );
  });

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Filters Card */}
      <div className="flex items-center gap-3 flex-wrap rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm theo email, tên người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter — native select */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-input bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang active</option>
            <option value="expired">Hết hạn</option>
            <option value="cancelled">Đã huỷ</option>
            <option value="pending_payment">Chờ thanh toán</option>
          </select>
        </div>

        <Button variant="outline" onClick={loadData} disabled={isLoading} className="rounded-xl">
          <Download className="h-4 w-4 mr-1" />
          Làm mới
        </Button>
        
        <Badge variant="outline" className="text-xs px-3 py-1.5 rounded-xl font-normal">
          Tổng bản ghi: <strong className="ml-1 text-foreground">{total}</strong>
        </Badge>
      </div>

      {/* Table Card */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground rounded-2xl border border-border bg-card">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
          Đang tải lịch sử đăng ký...
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Người dùng</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gói</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bắt đầu</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hết hạn</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub, i) => (
                <tr
                  key={sub._id}
                  className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {sub.userId?.displayName || sub.userId?.username || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">{sub.userId?.email || ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{sub.packageId?.name || "N/A"}</span>
                    {sub.packageId && (
                      <span className="ml-1 text-xs text-muted-foreground font-mono">
                        Lv.{sub.packageId.level}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[sub.status]}>
                      {STATUS_LABELS[sub.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.startAt)}</td>
                  <td className="px-4 py-3">
                    {sub.endAt ? (
                      <span
                        className={
                          new Date(sub.endAt) < new Date()
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {formatDate(sub.endAt)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Vĩnh viễn</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                </tr>
              ))}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Chưa có lịch sử đăng ký hoặc giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg"
          >
            ←
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg"
          >
            →
          </Button>
        </div>
      )}
    </div>
  );
}
