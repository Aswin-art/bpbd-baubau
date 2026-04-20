import "server-only";

import db from "@/lib/db";
import { getRedis, permNavCacheKey } from "@/lib/redis";

const PERM_TTL_SEC = 5 * 60;

/**
 * Navigation permissions cache (Redis). TTL: 5 minutes.
 * Falls back to database only when Redis is unavailable.
 */
export async function getCachedPermissions(
  role: string,
): Promise<Record<string, string[]>> {
  const normalizedRole = role.toLowerCase();
  const key = permNavCacheKey(normalizedRole);

  const client = await getRedis();
  if (client?.isOpen) {
    try {
      const raw = await client.get(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string[]>;
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      /* read-through to DB */
    }
  }

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

  if (client?.isOpen) {
    try {
      await client.set(key, JSON.stringify(permissions), { EX: PERM_TTL_SEC });
    } catch {
      /* best-effort cache */
    }
  }

  return permissions;
}

/**
 * Invalidate cache for a specific role, or all nav permission keys.
 */
export async function invalidatePermissionCache(role?: string): Promise<void> {
  const client = await getRedis();
  if (!client?.isOpen) return;

  try {
    if (role) {
      await client.del(permNavCacheKey(role));
      return;
    }

    for await (const key of client.scanIterator({
      MATCH: "bpbd:perm:nav:*",
      COUNT: 128,
    })) {
      await client.del(key);
    }
  } catch (e) {
    console.error("[permission-cache] invalidate failed:", e);
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
    return false;
  }
}
