import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OccupationRowActionItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface OccupationRowActionMenuProps {
  actions: OccupationRowActionItem[];
  ariaLabel?: string;
}

export default function OccupationRowActionMenu({
  actions,
  ariaLabel = "Mo menu thao tac",
}: OccupationRowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <EllipsisVertical className="size-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  if (action.disabled) return;
                  setOpen(false);
                  action.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  action.disabled
                    ? "cursor-not-allowed text-muted-foreground/50"
                    : action.destructive
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-popover-foreground hover:bg-muted",
                )}
              >
                {Icon ? <Icon className="size-4 shrink-0" /> : null}
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
