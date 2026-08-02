import { Outlet } from "react-router-dom";
import { Crown } from "lucide-react";
import PackageTabs from "@/features/packages/components/PackageTabs";

export default function PackagePage() {
  return (
    <div className="space-y-6">
      {/* Hero Banner matching GrammarPage / ReadingPage design */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-amber-950 via-purple-950 to-slate-950 px-6 py-6 text-white shadow-sm">
        <div className="hero-orb left-[-6rem] top-[-3rem] h-72 w-72 bg-amber-500/10" />
        <div className="hero-orb right-[-5rem] top-[2rem] h-72 w-72 bg-purple-500/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              <Crown className="size-4 text-amber-400" />
              Membership &amp; Payment Management
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
                Quản lý Gói Thành viên &amp; Thanh toán
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70">
                Tạo và cấu hình các gói VIP, phân quyền truy cập bài học và theo dõi lịch sử đăng ký, giao dịch của học viên trên toàn hệ thống.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <PackageTabs />

      {/* Nested Route Content */}
      <Outlet />
    </div>
  );
}
