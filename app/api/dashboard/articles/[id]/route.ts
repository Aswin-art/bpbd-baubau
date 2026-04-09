import { NextRequest } from "next/server";
import { z } from "zod";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { articleService } from "@/modules/articles/articles.service";

const updateArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    )
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .optional(),
  excerpt: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

/**
 * GET /api/articles/:id - Get article by ID
 * Requires: article:read permission
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

  const params = await context?.params;
  const id = params?.id;

  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Article ID is required", "MISSING_ID");
  }

  const article = await articleService.getById(id);

  if (!article) {
    throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
  }

  return apiSuccess(article);
});

/**
 * PATCH /api/articles/:id - Update article
 * Requires: article:update permission
 */
export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to update articles",
      "FORBIDDEN",
    );
  }

  const params = await context?.params;
  const id = params?.id;

  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Article ID is required", "MISSING_ID");
  }

  // Check existence
  const existingArticle = await articleService.getById(id);
  if (!existingArticle) {
    throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
  }

  const body = await req.json();

  const parseResult = updateArticleSchema.safeParse(body);
  if (!parseResult.success) {
    throw AppError.badRequest(
      parseResult.error.issues[0].message,
      "VALIDATION_ERROR",
    );
  }

  const article = await articleService.update(id, parseResult.data);

  return apiSuccess(article);
});

/**
 * DELETE /api/articles/:id - Delete article
 * Requires: article:delete permission
 */
export const DELETE = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete articles",
      "FORBIDDEN",
    );
  }

  const params = await context?.params;
  const id = params?.id;

  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Article ID is required", "MISSING_ID");
  }

  // Check existence
  const existingArticle = await articleService.getById(id);
  if (!existingArticle) {
    throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
  }

  await articleService.delete(id);

  return apiSuccess({ deleted: true });
});
