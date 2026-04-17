import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { articleService } from "@/modules/articles/articles.service";
import { z } from "zod";

/**
 * GET /api/dashboard/articles/:id/comments
 * Requires: articles:read
 */
export const GET = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view articles",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Article ID is required", "MISSING_ID");
  }

  const comments = await articleService.listComments(id);
  return apiSuccess({ comments });
});

const replySchema = z.object({
  parentCommentId: z.string().min(1),
  bodyHtml: z.string().min(1),
});

/**
 * POST /api/dashboard/articles/:id/comments
 * Reply to a comment as admin/staff.
 * Requires: articles:update
 */
export const POST = apiHandler(async (req: NextRequest, context) => {
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
  const id = params["id"];
  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Article ID is required", "MISSING_ID");
  }

  const body = await req.json().catch(() => null);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const created = await articleService.replyComment({
    articleId: id,
    parentCommentId: parsed.data.parentCommentId,
    user: session.user as any,
    bodyHtml: parsed.data.bodyHtml,
  });

  return apiSuccess({ comment: { ...created, createdAt: created.createdAt.toISOString() } }, 201);
});
