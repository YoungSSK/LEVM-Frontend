import { BookOpen } from "lucide-react";
import { Outlet } from "react-router-dom";

import ReadingTabs from "@/features/reading/components/ReadingTabs";

export default function ReadingPage() {
  return (
    <div className="space-y-6">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 px-6 py-6 text-white shadow-sm">
        <div className="hero-orb left-[-6rem] top-[-3rem] h-72 w-72 bg-emerald-500/10" />
        <div className="hero-orb right-[-5rem] top-[2rem] h-72 w-72 bg-teal-500/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              <BookOpen className="size-4" />
              Reading Management
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
                Quản lý hệ thống đọc hiểu
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70">
                Tổ chức danh mục bài đọc, bài đọc lý thuyết và bộ câu hỏi trắc nghiệm.
                Theo dõi, cập nhật và quản lý toàn bộ nội dung Reading trên hệ thống.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <ReadingTabs />

      {/* Child Feature View */}
      <Outlet />
    </div>
  );
}
