import { NextRequest } from "next/server";
import { z } from "zod";

import db from "@/lib/db";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { sanitizeCommentHtml } from "@/lib/comment-html";
import { checkPermission } from "@/lib/permission-cache";

function toIso(v: Date | string) {
  return v instanceof Date ? v.toISOString() : v;
}

const updateCommentSchema = z.object({
  bodyHtml: z.string().min(1),
});

/**
 * PATCH /api/public/articles/:slug/comments/:commentId
 * Edit an existing article comment from the public article page.
 * Requires articles:update.
 */
export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to edit article comments",
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

  const body = await req.json().catch(() => null);
  const parsed = updateCommentSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const sanitized = sanitizeCommentHtml(parsed.data.bodyHtml);
  if (!sanitized || sanitized.trim() === "") {
    throw AppError.badRequest("Komentar kosong", "EMPTY_COMMENT");
  }

  const existing = await db.articleComment.findFirst({
    where: { id: commentId, articleId: article.id },
    select: { id: true, userId: true },
  });
  if (!existing) {
    throw AppError.notFound("Comment not found", "COMMENT_NOT_FOUND");
  }
  if (existing.userId !== session.user.id) {
    throw AppError.forbidden(
      "You can only edit your own comments",
      "FORBIDDEN",
    );
  }

  const updated = await db.articleComment.update({
    where: { id: commentId },
    data: { bodyHtml: sanitized },
    select: {
      id: true,
      articleId: true,
      authorName: true,
      parentId: true,
      bodyHtml: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return apiSuccess({
    comment: {
      ...updated,
      createdAt: toIso(updated.createdAt),
    },
  });
});

