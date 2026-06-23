import { LayoutDashboard } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card className="glass-panel flex min-h-[60vh] flex-col items-center justify-center gap-4 border-border p-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <LayoutDashboard className="size-7" />
      </div>
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        Dashboard
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Đây là trang tổng quan. Bấm Occupation ở sidebar để chuyển sang
        OccupationPage.
      </p>
    </Card>
  );
}
