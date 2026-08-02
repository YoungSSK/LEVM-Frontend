import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { packageNavigationItems } from "@/features/packages/routes/packageRoutes";

interface PackageTabsProps {
  className?: string;
}

export default function PackageTabs({ className }: PackageTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm",
        className,
      )}
    >
      {packageNavigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "size-4",
                    isActive ? "text-primary-foreground" : "text-current",
                  )}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
