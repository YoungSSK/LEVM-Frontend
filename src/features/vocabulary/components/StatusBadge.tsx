import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  tone?: "success" | "warning" | "neutral";
  className?: string;
}

export default function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "success" && "bg-emerald-500/10 text-emerald-600",
        tone === "warning" && "bg-amber-500/10 text-amber-700",
        tone === "neutral" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
