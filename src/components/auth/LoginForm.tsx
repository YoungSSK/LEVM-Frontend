import { type ChangeEvent, type FormEvent, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authStore, useAuthStore } from "@/stores/auth.store";
import type { LoginFormValues } from "@/types/auth";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { isLoading, error } = useAuthStore();
  const [formValues, setFormValues] = useState<LoginFormValues>(initialValues);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "email" || name === "password") {
      setFormValues((current) => ({
        ...current,
        [name]: value,
      }));
    }

    authStore.clearError();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await authStore.login(formValues);
      toast.success("Đăng nhập thành công");
      setFormValues(initialValues);
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.error(message);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-heading text-white">
          Welcome Back
        </h2>
        <p className="text-sm text-[#cbc3d7] mt-1">
          Continue your mastery journey.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wider text-[#e5e1e4] uppercase block">
            Email
          </label>
          <div className="relative rounded-lg transition-all duration-200 focus-within:ring-4 focus-within:ring-primary/20">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0] h-5 w-5" />
            <input
              className="w-full bg-[#131315] border border-[#353437] text-[#e5e1e4] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-sm"
              name="email"
              onChange={handleChange}
              placeholder="pro@example.com"
              type="email"
              value={formValues.email}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold tracking-wider text-[#e5e1e4] uppercase block">
              Password
            </label>
            <a
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              href="#"
            >
              Forgot?
            </a>
          </div>
          <div className="relative rounded-lg transition-all duration-200 focus-within:ring-4 focus-within:ring-primary/20">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0] h-5 w-5" />
            <input
              className="w-full bg-[#131315] border border-[#353437] text-[#e5e1e4] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-sm"
              name="password"
              onChange={handleChange}
              placeholder="********"
              type="password"
              value={formValues.password}
              required
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full btn-3d-primary py-3 rounded-lg text-sm font-semibold tracking-wider uppercase mt-6 shadow-lg disabled:cursor-not-allowed disabled:opacity-80"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Signing In..." : "Sign In to Play"}
          </span>
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
