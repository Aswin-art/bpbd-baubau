import { NextRequest } from "next/server";
import { z } from "zod";

import db from "@/lib/db";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission, invalidatePermissionCache } from "@/lib/permission-cache";

const allowedRoleIds = ["admin", "operator", "kepala_bpbd", "masyarakat"] as const;

const updatePermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      resource: z.string().min(1),
      actions: z.array(z.string().min(1)).min(1),
    }),
  ),
});

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "permissions", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to update permissions",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) ?? {};
  const roleId = String(params.roleId || "").toLowerCase();
  if (!allowedRoleIds.includes(roleId as (typeof allowedRoleIds)[number])) {
    throw AppError.badRequest("Invalid role id", "VALIDATION_ERROR");
  }

  const body = await req.json();
  const parsed = updatePermissionsSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  // Dedupe & normalize actions per resource
  const normalized = new Map<string, string[]>();
  for (const p of parsed.data.permissions) {
    const key = p.resource.trim();
    if (!key) continue;
    const actions = Array.from(new Set(p.actions.map((a) => a.trim()).filter(Boolean)));
    if (actions.length === 0) continue;
    normalized.set(key, actions);
  }

  const resources = Array.from(normalized.keys());

  await db.$transaction(async (tx) => {
    // Remove permissions for resources not included anymore
    await tx.rolePermission.deleteMany({
      where: {
        role: roleId,
        ...(resources.length > 0 ? { resource: { notIn: resources } } : {}),
      },
    });

    for (const [resource, actions] of normalized.entries()) {
      await tx.rolePermission.upsert({
        where: { role_resource: { role: roleId, resource } },
        create: { role: roleId, resource, actions },
        update: { actions },
      });
    }
  });

  invalidatePermissionCache(roleId);

  const updated = await db.rolePermission.findMany({
    where: { role: roleId },
    select: { resource: true, actions: true },
    orderBy: { resource: "asc" },
  });

  return apiSuccess({
    role: roleId,
    permissions: updated.map((r) => ({
      resource: r.resource,
      actions: (r.actions as string[]) ?? [],
    })),
  });
});

