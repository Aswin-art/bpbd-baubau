import { NextRequest } from "next/server";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { articleService } from "@/modules/articles/articles.service";

/**
 * GET /api/articles/stats - Get article statistics
 * Requires: article:read permission
 */
export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view article stats",
      "FORBIDDEN",
    );
  }

  const stats = await articleService.getStats();

  return apiSuccess(stats);
});
