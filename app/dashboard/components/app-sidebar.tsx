"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ErrorBoundary } from "react-error-boundary";
import { useQueryClient } from "@tanstack/react-query";

import { NavUser } from "./nav-user";
import { SidebarNav } from "./sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SidebarErrorFallback({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 space-y-2 text-center">
      <p className="text-sm text-muted-foreground">Failed to load navigation</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Retry
      </Button>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [resetKey, setResetKey] = React.useState(0);

  const handleReset = () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
    setResetKey((prev) => prev + 1);
  };

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: (session?.user as any)?.photoUrl || "",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex h-full flex-col"
      >
        <SidebarHeader className="border-b border-sidebar-border/50 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard/profiles">
                  <div className="flex items-center gap-3 py-4">
                    <Image
                      src="/logo-bpbd.avif"
                      alt="BPBD Kota Baubau"
                      width={40}
                      height={40}
                      className="h-8 w-auto object-contain"
                    />
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold text-sm">BPBD Baubau</span>
                      <span className="text-xs text-muted-foreground">Dashboard</span>
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Separator className="mx-4 w-auto opacity-50" />
        <SidebarContent className="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:hover:bg-primary/50 [&::-webkit-scrollbar-thumb]:bg-primary/30 dark:[&::-webkit-scrollbar-thumb]:hover:bg-secondary/70 dark:[&::-webkit-scrollbar-thumb]:bg-secondary/50 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          {session?.user?.role ? (
            <ErrorBoundary
              FallbackComponent={SidebarErrorFallback}
              onReset={handleReset}
              resetKeys={[resetKey, session.user.role]}
            >
              <React.Suspense
                fallback={
                  <div className="px-4 py-3 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-9 w-full rounded bg-muted animate-pulse" />
                    <div className="h-9 w-full rounded bg-muted animate-pulse" />
                    <div className="h-9 w-full rounded bg-muted animate-pulse" />
                  </div>
                }
              >
                <SidebarNav />
              </React.Suspense>
            </ErrorBoundary>
          ) : (
            <div className="px-4 py-3 space-y-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded bg-muted animate-pulse" />
            </div>
          )}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </motion.div>
    </Sidebar>
  );
}
