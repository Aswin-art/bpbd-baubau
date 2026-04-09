import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  rolePermissionsService,
  updateRolePermissionSchema,
} from "@/modules/permissions";

export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "permissions", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to manage role permissions",
      "FORBIDDEN",
    );
  }

  const rows = await rolePermissionsService.listAll();
  return apiSuccess(rows);
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "permissions", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to manage role permissions",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = updateRolePermissionSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const updated = await rolePermissionsService.updateRolePermission(parsed.data);
  return apiSuccess(updated);
});

