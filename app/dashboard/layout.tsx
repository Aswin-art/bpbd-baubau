"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // TODO: add session check & role guard when backend is ready

  return (
    <div className="min-h-dvh bg-muted/30">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "pl-[68px]" : "pl-[240px]"
        )}
      >
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
