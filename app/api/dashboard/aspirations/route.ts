import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  aspirationListParamsSchema,
  createAspirationSchema,
  bulkChangeStatusSchema,
  bulkDeleteSchema,
} from "@/modules/aspirations";
import { aspirationService } from "@/modules/aspirations/aspirations.service";

/**
 * GET /api/dashboard/aspirations
 * Query: page, limit, q, status
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "aspirations", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view aspirations",
      "FORBIDDEN",
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = aspirationListParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    q: (searchParams.get("q") || "").trim() || undefined,
    status: (searchParams.get("status") || "").trim() || undefined,
  });

  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await aspirationService.list(parsed.data);
  return apiSuccess(result);
});

/**
 * PATCH /api/dashboard/aspirations
 * Bulk change status
 */
export const PATCH = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "aspirations", "change_status"))) {
    throw AppError.forbidden(
      "You don't have permission to change aspiration status",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = bulkChangeStatusSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload");
  }

  const result = await aspirationService.bulkChangeStatus(parsed.data);
  return apiSuccess(result);
});

/**
 * DELETE /api/dashboard/aspirations
 * Bulk delete
 */
export const DELETE = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "aspirations", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete aspirations",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = bulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload");
  }

  const result = await aspirationService.bulkDelete(parsed.data);
  return apiSuccess(result);
});

/**
 * POST /api/dashboard/aspirations
 * Create aspiration (dashboard)
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "aspirations", "create"))) {
    throw AppError.forbidden(
      "You don't have permission to create aspirations",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = createAspirationSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const created = await aspirationService.create(parsed.data);
  return apiSuccess(created, 201);
});

