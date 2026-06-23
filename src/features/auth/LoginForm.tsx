import { LockKeyhole, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import authApi from "@/api/authApi";
import { authStore } from "@/stores/authStore";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gọi API thật. Nếu backend chưa sẵn sàng, có thể tạm thay
      // bằng authStore.login(...) như bản demo cũ.
      const { accessToken, role } = await authApi.login({ email, password });

      if (role !== "admin") {
        toast.error("Bạn không có quyền truy cập trang quản trị");
        return;
      }

      authStore.login(accessToken, role);
      toast.success("Đăng nhập admin thành công");
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleLogin}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-2xl border-border bg-muted/50 pl-10 text-foreground placeholder:text-muted-foreground"
            placeholder="admin@levm.local"
          />
        </div>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-2xl border-border bg-muted/50 pl-10 text-foreground placeholder:text-muted-foreground"
            placeholder="••••••••"
          />
        </div>
      </label>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <button
          type="button"
          className="text-primary transition-colors hover:opacity-80"
        >
          Quên mật khẩu?
        </button>
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-full font-semibold shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}