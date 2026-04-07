import { LRUCache } from "lru-cache";
import db from "@/lib/db";
import { navigationResources } from "./navigation-data";

type RoleId = "admin" | "staff" | "lecturer" | "student";

/**
 * In-memory cache for role permissions
 * TTL: 5 minutes
 */
const navCache = new LRUCache<RoleId, Record<string, string[]>>({
  max: 10,
  ttl: 5 * 60 * 1000, // 5 minutes
});

/**
 * Get only navigation-related permissions
 */
export async function getCachedPermissions(
  role: RoleId,
): Promise<Record<string, string[]>> {
  const cached = navCache.get(role);

  if (cached) {
    return cached;
  }

  // Fetch only navigation-related resources from database
  const dbPermissions = await db.rolePermission.findMany({
    where: {
      role,
      resource: { in: [...navigationResources] },
    },
    select: {
      resource: true,
      actions: true,
    },
  });

  const permissions: Record<string, string[]> = {};
  for (const p of dbPermissions) {
    permissions[p.resource] = p.actions as string[];
  }

  // Update nav cache
  navCache.set(role, permissions);

  return permissions;
}

/**
 * Invalidate cache for a specific role
 */
export function invalidatePermissionCache(role?: RoleId): void {
  if (role) {
    navCache.delete(role);
  } else {
    navCache.clear();
  }
}

/**
 * Check if a role has a specific action on a resource
 */
export async function checkPermission(
  role: string | null | undefined,
  resource: string,
  action: string,
): Promise<boolean> {
  if (!role) return false;

  const normalizedRole = role.toLowerCase() as RoleId;
  if (!["admin", "staff", "lecturer", "student"].includes(normalizedRole)) {
    return false;
  }

  try {
    const permissions = await getCachedPermissions(normalizedRole);
    const resourcePermissions = permissions[resource];

    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  } catch {
    // Fallback to false if database is not available
    return false;
  }
}
