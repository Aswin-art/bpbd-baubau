import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { aspirationService } from "@/modules/aspirations";

export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "aspirations", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view aspiration stats",
      "FORBIDDEN",
    );
  }

  const stats = await aspirationService.getStats();
  return apiSuccess(stats);
});

