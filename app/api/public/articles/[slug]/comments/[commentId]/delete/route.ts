import { NextRequest } from "next/server";

import db from "@/lib/db";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";

/**
 * POST /api/public/articles/:slug/comments/:commentId/delete
 * Delete an article comment from the public article page.
 * Requires articles:delete.
 */
export const POST = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete article comments",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const slug = params["slug"];
  const commentId = params["commentId"];
  if (!slug || typeof slug !== "string") {
    throw AppError.badRequest("Missing slug", "MISSING_SLUG");
  }
  if (!commentId || typeof commentId !== "string") {
    throw AppError.badRequest("Missing comment ID", "MISSING_COMMENT_ID");
  }

  const article = await db.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!article || article.status !== "PUBLISHED") {
    throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
  }

  const existing = await db.articleComment.findFirst({
    where: { id: commentId, articleId: article.id },
    select: { id: true },
  });
  if (!existing) {
    throw AppError.notFound("Comment not found", "COMMENT_NOT_FOUND");
  }

  await db.articleComment.delete({ where: { id: commentId } });
  return apiSuccess({ deleted: true });
});
