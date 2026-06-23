import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  end?: boolean;
  badge?: string;
}

export default function SidebarItem({
  icon: Icon,
  label,
  to,
  end = false,
  badge,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "size-[18px] shrink-0",
              isActive ? "text-sidebar-primary-foreground" : "text-current",
            )}
          />
          <span className="flex-1 text-left">{label}</span>
          {badge ? (
            <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
          ) : null}
          {isActive ? (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-sidebar-primary-foreground/70" />
          ) : null}
        </>
      )}
    </NavLink>
  );
}
