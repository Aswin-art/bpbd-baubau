import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { aspirationCitizenService } from "@/modules/aspirations/aspirations-citizen.service";

/**
 * GET /api/dashboard/my-aspirations/stats
 */
export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "my_aspirations", "read"))) {
    throw AppError.forbidden(
      "Anda tidak memiliki akses ke statistik aspirasi.",
      "FORBIDDEN",
    );
  }

  const stats = await aspirationCitizenService.getStats(session.user.id);
  return apiSuccess(stats);
});
