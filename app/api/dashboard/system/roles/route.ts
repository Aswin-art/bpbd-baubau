import { NextRequest } from "next/server";
import { z } from "zod";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { rolePermissionsService } from "@/modules/permissions";

const roleListQuerySchema = z.object({
  includePermissions: z
    .enum(["0", "1"])
    .optional()
    .transform((v) => v === "1"),
});

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "permissions", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to read permissions",
      "FORBIDDEN",
    );
  }

  const parsed = roleListQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid query params",
      "VALIDATION_ERROR",
    );
  }

  const includePermissions = parsed.data.includePermissions || true;
  const roles = await rolePermissionsService.listDashboardRoles(
    includePermissions,
  );

  return apiSuccess({ roles });
});
