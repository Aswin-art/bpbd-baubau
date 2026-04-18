import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";
import { DEFAULT_MAP_TYPE_COLORS, normalizeMapColor } from "@/lib/map-disaster-colors";

/**
 * GET /api/dashboard/maps/categories
 * Returns predefined types plus any custom types already stored, including colors.
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
    select: { type: true, typeColor: true, updatedAt: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  const items = new Map<string, { id: string; label: string; color: string }>();

  for (const [type, color] of Object.entries(DEFAULT_MAP_TYPE_COLORS)) {
    items.set(type, { id: type, label: type, color });
  }

  for (const row of rows) {
    const type = (row.type || "").trim();
    if (!type) continue;
    items.set(type, {
      id: type,
      label: type,
      color: normalizeMapColor(row.typeColor) ?? "#6b7280",
    });
  }

  return apiSuccess(Array.from(items.values()));
});

