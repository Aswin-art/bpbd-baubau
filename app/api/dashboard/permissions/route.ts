import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { RoleId } from "@/modules/permissions";
import { getCachedPermissions } from "@/lib/permission-cache";

/**
 * Return permissions map for current user role.
 * Used by client-side navigation and PermissionGuard.
 */
export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!session.user.role) {
    throw AppError.unauthorized("Role not found", "UNAUTHORIZED");
  }

  const role = session.user.role;

  const normalizedRole = role.toLowerCase() as RoleId;
  if (!["admin","operator","kepala_bpbd","masyarakat",].includes(normalizedRole)) {
    throw AppError.forbidden("Invalid role", "INVALID_ROLE");
  }

  const permissions = await getCachedPermissions(normalizedRole);

  return apiSuccess({
    permissions,
  });
});

