import { BookOpenText } from "lucide-react";
import { Outlet } from "react-router-dom";

import VocabularyTabs from "@/features/vocabulary/components/VocabularyTabs";

export default function VocabularyPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-6 text-white shadow-sm">
        <div className="hero-orb left-[-6rem] top-[-3rem] h-72 w-72 bg-cyan-500/10" />
        <div className="hero-orb right-[-5rem] top-[2rem] h-72 w-72 bg-sky-500/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              <BookOpenText className="size-4" />
              Vocabulary Management
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
                Topics, Lessons và Words trong một workspace
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70">
                Quản lý từ vựng theo feature-based architecture, tối ưu cho mở
                rộng và tái sử dụng component.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">
              Navigation
            </p>
            <p className="mt-1 font-medium text-white">
              Chọn Topics hoặc Words để bắt đầu.
            </p>
          </div>
        </div>
      </section>

      <VocabularyTabs />

      <Outlet />
    </div>
  );
}
