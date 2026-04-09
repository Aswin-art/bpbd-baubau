import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";

/**
 * GET /api/dashboard/maps/categories
 * Returns distinct disaster types for SearchSelect options.
 */
export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "maps", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view map categories",
      "FORBIDDEN",
    );
  }

  const rows = await db.mapDisasterPoint.findMany({
    select: { type: true },
    distinct: ["type"],
    orderBy: [{ type: "asc" }],
  });

  const types = rows
    .map((r) => (r.type || "").trim())
    .filter(Boolean);

  return apiSuccess(types);
});

