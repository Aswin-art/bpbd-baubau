"use client";

import * as React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getNavStructure } from "@/lib/navigation-data";
import { NavMain } from "./nav-main";

async function getNavigationPermissions(): Promise<Record<string, string[]>> {
  const res = await fetch("/api/dashboard/permissions");
  if (!res.ok) {
    throw new Error("Failed to fetch permissions");
  }
  const json = await res.json();
  return json.data.permissions;
}

export function SidebarNav() {
  const { data: permissions } = useSuspenseQuery({
    queryKey: ["permissions"],
    queryFn: getNavigationPermissions,
    staleTime: 1000 * 60 * 5,
  });

  const hasPageAccess = React.useCallback(
    (resource: string) => {
      const resourceActions = permissions[resource];
      if (!resourceActions) return false;
      // Sidebar items should only appear when the user can open the page itself.
      return resourceActions.includes("read") || resourceActions.includes("view");
    },
    [permissions],
  );

  const navMain = React.useMemo(() => {
    const navStructure = getNavStructure();

    // Filter navigation based on user permissions
    return navStructure
      .map((group) => {
        const filteredItems = group.items
          .map((item) => {
            // Check if item has sub-items
            if ("items" in item && item.items) {
              const filteredSubItems = item.items.filter((subItem) =>
                hasPageAccess(subItem.permission),
              );
              // Only include parent if it has accessible sub-items
              if (filteredSubItems.length === 0) return null;
              return { ...item, items: filteredSubItems };
            }

            // Check permission for single item
            if (item.permission && !hasPageAccess(item.permission)) return null;
            return item;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        // Only include group if it has accessible items
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      })
      .filter((group): group is NonNullable<typeof group> => group !== null);
  }, [hasPageAccess]);

  return (
    <>
      {navMain.map((group) => (
        <NavMain key={group.title} title={group.title} items={group.items} />
      ))}
    </>
  );
}
