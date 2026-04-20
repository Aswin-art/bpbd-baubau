import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server";
import { canAccessDashboard, parseRole } from "@/lib/rbac";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const role = parseRole(session?.user as { role?: string | null } | undefined);
  const isActive = (session?.user as { isActive?: boolean | null } | undefined)?.isActive;
  const banned = (session?.user as { banned?: boolean | null } | undefined)?.banned;

  if (
    !session?.user ||
    !canAccessDashboard(role) ||
    isActive === false ||
    banned === true
  ) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        <main className="p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
