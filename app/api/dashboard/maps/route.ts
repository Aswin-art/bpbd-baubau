import { NextRequest } from "next/server";
import { z } from "zod";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
});

/**
 * DELETE /api/dashboard/maps
 * Bulk delete map disaster points
 * Requires: maps:delete
 */
export const DELETE = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "maps", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete map points",
      "FORBIDDEN",
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const { ids } = parsed.data;

  const result = await db.mapDisasterPoint.deleteMany({
    where: { id: { in: ids } },
  });

  return apiSuccess({
    count: result.count,
    ids,
  });
});

