import { BookOpen, Briefcase, LayoutDashboard, LayoutGrid } from "lucide-react";

import logo from "@/assets/logo.png";
import SidebarItem from "@/components/layout/SidebarItem";

const TABS: {
  key: string;
  label: string;
  icon: typeof LayoutGrid;
  to: string;
  end?: boolean;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/",
    end: true,
  },
  {
    key: "occupation",
    label: "Occupation",
    icon: Briefcase,
    to: "/occupation",
  },
  {
    key: "vocabulary",
    label: "Vocabulary",
    icon: BookOpen,
    to: "/vocabulary",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-svh w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <img
          src={logo}
          alt="LEVM Admin"
          className="size-10 rounded-xl border border-sidebar-border bg-white object-contain p-1"
        />
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            LEVM
          </p>
          <p className="font-heading text-base font-semibold text-sidebar-foreground">
            Admin Workspace
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Chức năng
        </p>
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <SidebarItem
              key={tab.key}
              icon={tab.icon}
              label={tab.label}
              to={tab.to}
              end={tab.end}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
