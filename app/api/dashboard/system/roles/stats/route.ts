import { NextRequest } from "next/server";

import db from "@/lib/db";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";

export const GET = apiHandler(async (_req: NextRequest) => {
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

  const [totalAdmins, totalStaff, totalOthers] = await Promise.all([
    db.user.count({ where: { role: "admin" } }),
    db.user.count({ where: { role: "operator" } }),
    db.user.count({ where: { role: { in: ["kepala_bpbd", "masyarakat"] } } }),
  ]);

  return apiSuccess({
    totalRoles: 4,
    totalAdmins,
    totalStaff,
    totalLecturers: totalOthers,
  });
});

