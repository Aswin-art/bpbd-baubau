import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";

/** Default types (same as legend on public disaster map). */
const DEFAULT_DISASTER_TYPES = [
  "Banjir",
  "Tanah Longsor",
  "Angin Puting Beliung",
  "Kebakaran",
  "Gelombang Tinggi",
] as const;

/**
 * GET /api/dashboard/maps/categories
 * Returns predefined types plus any custom types already stored (deduped).
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

  const fromDb = rows
    .map((r) => (r.type || "").trim())
    .filter(Boolean);

  const defaultSet = new Set<string>(DEFAULT_DISASTER_TYPES);
  const extras = fromDb.filter((t) => !defaultSet.has(t));

  return apiSuccess([...DEFAULT_DISASTER_TYPES, ...extras]);
});

