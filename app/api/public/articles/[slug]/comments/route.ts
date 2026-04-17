import { NextRequest } from "next/server";
import { z } from "zod";

import db from "@/lib/db";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { sanitizeCommentHtml } from "@/lib/comment-html";
import { parseRole, isStaffRole } from "@/lib/rbac";

function toIso(v: Date | string) {
  return v instanceof Date ? v.toISOString() : v;
}

const createCommentSchema = z.object({
  bodyHtml: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

/**
 * GET /api/public/articles/:slug/comments
 * Public list of comments for an article.
 */
export const GET = apiHandler(async (_req: NextRequest, context) => {
  const params = (await context?.params) || {};
  const slug = params["slug"];
  if (!slug || typeof slug !== "string") {
    throw AppError.badRequest("Missing slug", "MISSING_SLUG");
  }

  const article = await db.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!article || article.status !== "PUBLISHED") {
    throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
  }

  const comments = await db.articleComment.findMany({
    where: { articleId: article.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      articleId: true,
      userId: true,
      authorName: true,
      parentId: true,
      bodyHtml: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return apiSuccess({
    comments: comments.map((c) => ({
      ...c,
      createdAt: toIso(c.createdAt),
    })),
  });
});

/**
 * POST /api/public/articles/:slug/comments
 * Requires login to comment.
 */
export const POST = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  const params = (await context?.params) || {};
  const slug = params["slug"];
  if (!slug || typeof slug !== "string") {
    throw AppError.badRequest("Missing slug", "MISSING_SLUG");
  }

  const article = await db.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!article || article.status !== "PUBLISHED") {
    throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
  }

  const body = await req.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const authorName = String(
    session.user.name ||
      (session.user as any).displayUsername ||
      (session.user as any).username ||
      session.user.email ||
      "Pengguna",
  );

  const role = parseRole(session.user as any);
  const isAdmin = isStaffRole(role);

  const sanitized = sanitizeCommentHtml(parsed.data.bodyHtml);
  if (!sanitized || sanitized.trim() === "") {
    throw AppError.badRequest("Komentar kosong", "EMPTY_COMMENT");
  }

  // If parentId is provided, validate that it belongs to the same article.
  const parentId = parsed.data.parentId ?? null;
  if (parentId) {
    const parent = await db.articleComment.findFirst({
      where: { id: parentId, articleId: article.id },
      select: { id: true },
    });
    if (!parent) {
      throw AppError.badRequest("Parent comment not found", "INVALID_PARENT");
    }
  }

  const created = await db.articleComment.create({
    data: {
      article: { connect: { id: article.id } },
      user: { connect: { id: session.user.id } },
      authorName,
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
      bodyHtml: sanitized,
      isAdmin,
    },
    select: {
      id: true,
      articleId: true,
      userId: true,
      authorName: true,
      parentId: true,
      bodyHtml: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return apiSuccess(
    {
      comment: {
        ...created,
        createdAt: toIso(created.createdAt),
      },
    },
    201,
  );
});

