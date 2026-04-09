import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { updateDocumentSchema } from "@/modules/documents";
import { documentService } from "@/modules/documents/documents.service";

export const GET = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "documents", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view documents",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const doc = await documentService.getById(id);
  return apiSuccess(doc);
});

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "documents", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to update documents",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const body = await req.json();
  const parsed = updateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const updated = await documentService.update(id, parsed.data);
  return apiSuccess(updated);
});

export const DELETE = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "documents", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete documents",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const result = await documentService.delete(id);
  return apiSuccess(result);
});

