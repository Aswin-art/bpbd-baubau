import { NextRequest } from "next/server";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { createArticleSchema } from "@/modules/articles";
import { articleService } from "@/modules/articles/articles.service";
import { z } from "zod";

/**
 * GET /api/articles - List all articles
 * Requires: article:read permission
 */
export const GET = apiHandler(async (req: NextRequest) => {
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

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : 10;
  const search = searchParams.get("q") || undefined;

  let status = searchParams.get("status") as
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED"
    | undefined;

  const category = searchParams.get("category") || undefined;

  const result = await articleService.list({
    page,
    limit,
    search,
    status,
    category,
  });

  return apiSuccess(result);
});

/**
 * POST /api/articles - Create new article
 * Requires: article:create permission
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "articles", "create"))) {
    throw AppError.forbidden(
      "You don't have permission to create articles",
      "FORBIDDEN",
    );
  }

  const body = await req.json();

  const parseResult = createArticleSchema.safeParse(body);
  if (!parseResult.success) {
    throw AppError.badRequest(
      parseResult.error.issues[0].message,
      "VALIDATION_ERROR",
    );
  }

  const article = await articleService.create(
    parseResult.data,
    session.user.id,
  );

  return apiSuccess(article);
});

const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["PUBLISH", "ARCHIVE"]),
});

/**
 * PATCH /api/dashboard/articles
 * Bulk update article status (PUBLISH, ARCHIVE)
 * Requires: article:update permission
 */
export const PATCH = apiHandler(async (req: NextRequest) => {
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

  const body = await req.json();
  const parseResult = bulkActionSchema.safeParse(body);

  if (!parseResult.success) {
    throw AppError.badRequest(
      parseResult.error.issues[0].message,
      "VALIDATION_ERROR",
    );
  }

  const { ids, action } = parseResult.data;

  let result;
  if (action === "PUBLISH") {
    result = await articleService.bulkPublish(ids);
  } else if (action === "ARCHIVE") {
    result = await articleService.bulkArchive(ids);
  }

  return apiSuccess({
    count: result?.count || 0,
    action,
    ids,
  });
});

const deleteActionSchema = z.object({
  ids: z.array(z.string()).min(1),
});

/**
 * DELETE /api/dashboard/articles
 * Bulk delete articles
 * Requires: article:delete permission
 */
export const DELETE = apiHandler(async (req: NextRequest) => {
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

  const body = await req.json();
  const parseResult = deleteActionSchema.safeParse(body);

  if (!parseResult.success) {
    throw AppError.badRequest(
      parseResult.error.issues[0].message,
      "VALIDATION_ERROR",
    );
  }

  const { ids } = parseResult.data;

  const result = await articleService.bulkDelete(ids);

  return apiSuccess({
    count: result?.count || 0,
    ids,
  });
});
