import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  archiveListParamsSchema,
  createArchiveSchema,
  bulkDeleteArchivesSchema,
} from "@/modules/archives";
import { archiveService } from "@/modules/archives/archives.service";

/**
 * GET /api/dashboard/archives
 * Query: page, limit, q, year
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "archives", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view archives",
      "FORBIDDEN",
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = archiveListParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    q: (searchParams.get("q") || "").trim() || undefined,
    year: (searchParams.get("year") || "").trim() || undefined,
  });

  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await archiveService.list(parsed.data);
  return apiSuccess(result);
});

/**
 * POST /api/dashboard/archives
 * Create archive document
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "archives", "create"))) {
    throw AppError.forbidden(
      "You don't have permission to create archives",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = createArchiveSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const created = await archiveService.create(parsed.data);
  return apiSuccess(created, 201);
});

/**
 * DELETE /api/dashboard/archives
 * Bulk delete archive documents
 */
export const DELETE = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "archives", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete archives",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = bulkDeleteArchivesSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await archiveService.bulkDelete(parsed.data);
  return apiSuccess(result);
});

