import { cn } from "@/lib/utils";

interface OccupationStatusChipProps {
  active: boolean;
  className?: string;
}

export default function OccupationStatusChip({
  active,
  className,
}: OccupationStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        active
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {active ? "Đang hoạt động" : "Tạm ẩn"}
    </span>
  );
}
