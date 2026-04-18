import { LRUCache } from "lru-cache";
import db from "@/lib/db";

/**
 * In-memory cache for role permissions
 * TTL: 5 minutes
 */
const navCache = new LRUCache<string, Record<string, string[]>>({
  max: 10,
  ttl: 5 * 60 * 1000, // 5 minutes
});

/**
 * Get only navigation-related permissions
 */
export async function getCachedPermissions(
  role: string,
): Promise<Record<string, string[]>> {
  const normalizedRole = role.toLowerCase();
  const cached = navCache.get(normalizedRole);

  if (cached) {
    return cached;
  }

  // Fetch permissions from database
  const dbPermissions = await db.rolePermission.findMany({
    where: {
      role: normalizedRole,
    },
    select: {
      resource: true,
      actions: true,
    },
  });

  const permissions: Record<string, string[]> = {};
  for (const p of dbPermissions) {
    const actions = (p.actions as string[]) ?? [];
    if (actions.length === 0) continue;
    permissions[p.resource] = actions;
  }

  // Update nav cache
  navCache.set(normalizedRole, permissions);

  return permissions;
}

/**
 * Invalidate cache for a specific role
 */
export function invalidatePermissionCache(role?: string): void {
  if (role) {
    navCache.delete(role.toLowerCase());
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

  try {
    const permissions = await getCachedPermissions(role);
    const resourcePermissions = permissions[resource];

    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  } catch {
    // Fallback to false if database is not available
    return false;
  }
}
