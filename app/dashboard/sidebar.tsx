"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  MessageSquareText,
  Archive,
  Settings,
  ChevronLeft,
  LogOut,
  Bell,
  Users,
  Shield,
  Map,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canSeeNavItem,
  ROLE_LABELS,
  type DashboardNavKey,
  type DashboardRole,
} from "@/lib/rbac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const mainNav: {
  key: DashboardNavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "news", label: "Berita", href: "/dashboard/news", icon: Newspaper },
  { key: "documents", label: "Dokumen", href: "/dashboard/documents", icon: FileText },
  {
    key: "aspirations",
    label: "Aspirasi",
    href: "/dashboard/aspirations",
    icon: MessageSquareText,
  },
  { key: "archives", label: "Arsip Bencana", href: "/dashboard/archives", icon: Archive },
  {
    key: "map",
    label: "Map Bencana",
    href: "/dashboard/map",
    icon: Map,
  },
];

const bottomNav: {
  key: DashboardNavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "notifications", label: "Notifikasi", href: "/dashboard/notifications", icon: Bell },
  { key: "users", label: "Pengguna", href: "/dashboard/users", icon: Users },
  {
    key: "settings",
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    key: "rbac",
    label: "Kontrol RBAC",
    href: "/dashboard/rbac",
    icon: Shield,
  },
];

// TODO: replace with real session data later
const DUMMY_USER = {
  name: "Admin BPBD",
  email: "admin@bpbd-baubau.go.id",
  role: "admin" as DashboardRole,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const role = DUMMY_USER.role;
  const visibleMain = mainNav.filter((item) => canSeeNavItem(role, item.key));
  const visibleBottom = bottomNav.filter((item) =>
    canSeeNavItem(role, item.key)
  );

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const initials = DUMMY_USER.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    // TODO: call signOut() from auth client when backend is ready
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-2" : "gap-3 px-4"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex shrink-0 items-center rounded-lg transition-colors hover:bg-muted/60",
              collapsed
                ? "h-10 w-10 justify-center"
                : "gap-2.5 py-1 pr-2"
            )}
          >
            <Image
              src="/logo-bpbd.avif"
              alt="Logo BPBD"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[13px] font-extrabold text-secondary leading-none">
                  BPBD
                </span>
                <span className="text-[9px] font-medium text-muted-foreground tracking-wide uppercase mt-0.5">
                  Dashboard
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Main navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4",
            collapsed ? "px-2" : "px-3"
          )}
        >
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Menu Utama
              </p>
            )}
            {visibleMain.map((item) => {
              const active = isActive(item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
                    collapsed
                      ? "h-10 w-full min-h-10 justify-center p-0"
                      : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 pointer-events-none",
                      active ? "text-primary" : ""
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Lainnya
              </p>
            )}
            {visibleBottom.map((item) => {
              const active = isActive(item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
                    collapsed
                      ? "h-10 w-full min-h-10 justify-center p-0"
                      : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 pointer-events-none",
                      active ? "text-primary" : ""
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </div>
        </nav>

        {/* Collapse toggle */}
        <div
          className={cn(
            "mb-3 flex shrink-0",
            collapsed ? "justify-center px-2" : "px-3"
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed ? "h-10 w-10 shrink-0" : "h-9 w-full px-2"
            )}
            aria-label={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* User profile */}
        <div
          className={cn(
            "border-t border-border py-3 shrink-0",
            collapsed ? "flex justify-center px-2" : "px-3"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Keluar
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {DUMMY_USER.name}
                </p>
                <p className="text-[10px] font-medium text-primary/90 truncate">
                  {ROLE_LABELS[role]}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {DUMMY_USER.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                aria-label="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
