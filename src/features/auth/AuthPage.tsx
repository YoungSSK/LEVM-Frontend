import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import LoginForm from "@/features/auth/LoginForm";

export default function AuthPage() {
  const navigate = useNavigate();
  const { accessToken, role } = useAuthStore();
  const profile = useUserStore((state) => state.profile);

  return (
    <div className="min-h-svh overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="hero-orb left-[-6rem] top-[-3rem] h-72 w-72 bg-sky-500/5" />
        <div className="hero-orb right-[-6rem] top-[10rem] h-72 w-72 bg-violet-500/5" />
        <div className="hero-orb bottom-[-6rem] left-1/2 h-96 w-96 -translate-x-1/2 bg-cyan-500/5" />
      </div>

      <div className="relative grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-gradient-to-br from-slate-100 to-slate-200/80 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="max-w-2xl space-y-8">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="LEVM Admin"
                className="size-12 rounded-2xl border border-border bg-white object-contain p-1.5 shadow-sm"
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
                  LEVM Admin
                </p>
                <p className="font-heading text-xl font-semibold text-slate-800">
                  Learning Workspace
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-700">
                <Sparkles className="size-3.5" />
                Admin entry
              </span>

              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl xl:text-6xl">
                Đăng nhập để điều phối{" "}
                <span className="text-gradient">nội dung học tập</span> theo
                đúng pipeline.
              </h1>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-8 lg:px-10 lg:py-10">
          <Card className="glass-panel-strong w-full max-w-xl border-border p-0 shadow-lg">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
                    Access panel
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-800">
                    Đăng nhập admin
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dùng tài khoản demo hoặc mở workspace ngay lập tức để xem
                    giao diện quản trị.
                  </p>
                </div>

                <div className="hidden size-12 items-center justify-center rounded-2xl border border-border bg-muted/60 text-sky-700 sm:flex">
                  <LockKeyhole className="size-5" />
                </div>
              </div>

              {accessToken ? (
                <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-700">
                    Bạn đang có một phiên đăng nhập sẵn.
                  </p>
                  <p className="mt-1 text-sm text-emerald-600/75">
                    {profile?.displayName ?? profile?.email ?? "Admin"} •{" "}
                    {role}
                  </p>
                  <Button
                    className="mt-4 h-11 w-full rounded-full"
                    onClick={() => navigate("/")}
                  >
                    Đi tới dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              ) : null}

              <LoginForm onSuccess={() => navigate("/")} />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}