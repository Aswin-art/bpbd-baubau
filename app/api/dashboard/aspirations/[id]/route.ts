import { NextRequest } from "next/server";
import { z } from "zod";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  aspirationService,
  aspirationStatusSchema,
  updateAspirationSchema,
} from "@/modules/aspirations";

export const GET = apiHandler(async (_req: NextRequest, context) => {
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

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const aspiration = await aspirationService.getById(id);
  return apiSuccess(aspiration);
});

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  const canChangeStatus = await checkPermission(
    session.user.role,
    "aspirations",
    "change_status",
  );
  const canUpdate = await checkPermission(session.user.role, "aspirations", "update");

  if (!canChangeStatus && !canUpdate) {
    throw AppError.forbidden(
      "You don't have permission to update aspirations",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const body = await req.json();
  const statusOnly = z.object({ status: aspirationStatusSchema }).safeParse(body);
  if (statusOnly.success) {
    if (!canChangeStatus) {
      throw AppError.forbidden(
        "You don't have permission to change aspiration status",
        "FORBIDDEN",
      );
    }
    const updated = await aspirationService.changeStatus(id, statusOnly.data.status);
    return apiSuccess(updated);
  }

  if (!canUpdate) {
    throw AppError.forbidden(
      "You don't have permission to update aspirations",
      "FORBIDDEN",
    );
  }

  const parsed = updateAspirationSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const updated = await aspirationService.update(id, parsed.data);

  return apiSuccess(updated);
});

export const DELETE = apiHandler(async (_req: NextRequest, context) => {
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

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const result = await aspirationService.delete(id);
  return apiSuccess(result);
});

