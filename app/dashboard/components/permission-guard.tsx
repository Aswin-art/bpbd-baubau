"use client";

import { useQuery } from "@tanstack/react-query";
import { ForbiddenPage } from "./forbidden-page";

async function getPermissions(): Promise<Record<string, string[]>> {
  const res = await fetch("/api/dashboard/permissions");
  if (!res.ok) {
    throw new Error("Failed to fetch permissions");
  }
  const json = await res.json();
  return json.data.permissions;
}

/**
 * Client-side permission gate.
 * Uses the same React Query cache as the sidebar navigation.
 * Renders children if the user has `read` access, otherwise shows 403.
 */
export function PermissionGuard({
  resource,
  action = "read",
  children,
}: {
  resource: string;
  action?: string;
  children: React.ReactNode;
}) {
  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
    staleTime: 1000 * 60 * 5,
  });

  // Still loading — permissions will come from the shared cache almost instantly
  if (!permissions) return null;

  const resourceActions = permissions[resource];
  const hasAccess = resourceActions?.includes(action) ?? false;

  if (!hasAccess) return <ForbiddenPage />;

  return <>{children}</>;
}
