import { Outlet } from "react-router-dom";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useFetchProfile } from "@/features/auth/useFetchProfile";

export default function AdminLayout() {
  useFetchProfile();

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />

      <div className="flex min-h-svh flex-1 flex-col">
        <Header />
        <main className="dashboard-grid flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
