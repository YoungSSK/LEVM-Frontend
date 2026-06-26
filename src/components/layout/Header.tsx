import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { vocabularyRoutePaths } from "@/features/vocabulary/routes/vocabularyRoutes";
import { authStore, useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";

function getInitials(email?: string) {
  if (!email) return "AD";
  return email.slice(0, 2).toUpperCase();
}

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/occupation") return "Occupation";
  if (pathname === vocabularyRoutePaths.root) return "Vocabulary";
  if (pathname === vocabularyRoutePaths.topics) return "Topics";
  if (pathname === vocabularyRoutePaths.words) return "Words";
  if (pathname.startsWith(`${vocabularyRoutePaths.topics}/`)) {
    return "Topic Detail";
  }
  if (pathname.startsWith(`${vocabularyRoutePaths.words}/`)) {
    return "Word Detail";
  }
  if (pathname.startsWith(`${vocabularyRoutePaths.lessons}/`)) {
    return "Lesson Detail";
  }
  if (pathname.startsWith(vocabularyRoutePaths.root)) return "Vocabulary";
  return "Dashboard";
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role } = useAuthStore();
  const profile = useUserStore((state) => state.profile);
  const title = getPageTitle(pathname);

  const handleLogout = () => {
    authStore.logout();
    navigate("/auth");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Admin Workspace
        </p>
        <p className="font-heading text-sm font-semibold text-foreground">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {getInitials(profile?.email)}
        </div>

        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-medium text-foreground">
            {profile?.displayName ?? profile?.email ?? "Admin"}
          </p>
          <p className="text-xs text-muted-foreground">{role ?? ""}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-border text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
