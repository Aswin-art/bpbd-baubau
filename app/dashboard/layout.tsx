"use client";

import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        <main className="p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
