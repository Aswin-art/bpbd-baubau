import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { articleService } from "@/modules/articles/articles.service";

/**
 * DELETE /api/dashboard/articles/:id/comments/:commentId
 * Menghapus komentar (termasuk balasan turunannya).
 * Requires: articles:update
 */
export const DELETE = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to moderate comments",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const articleId = params["id"];
  const commentId = params["commentId"];
  if (!articleId || typeof articleId !== "string") {
    throw AppError.badRequest("Article ID is required", "MISSING_ID");
  }
  if (!commentId || typeof commentId !== "string") {
    throw AppError.badRequest("Comment ID is required", "MISSING_COMMENT_ID");
  }

  const result = await articleService.deleteComment(articleId, commentId);
  return apiSuccess(result);
});
