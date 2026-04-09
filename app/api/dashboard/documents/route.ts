import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  bulkDeleteDocumentsSchema,
  createDocumentSchema,
  documentListParamsSchema,
} from "@/modules/documents";
import { documentService } from "@/modules/documents/documents.service";

export const GET = apiHandler(async (req: NextRequest) => {
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

  const { searchParams } = new URL(req.url);
  const parsed = documentListParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    q: (searchParams.get("q") || "").trim() || undefined,
    category: (searchParams.get("category") || "").trim() || undefined,
  });

  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await documentService.list(parsed.data);
  return apiSuccess(result);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "documents", "create"))) {
    throw AppError.forbidden(
      "You don't have permission to create documents",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const created = await documentService.create(parsed.data);
  return apiSuccess(created, 201);
});

export const DELETE = apiHandler(async (req: NextRequest) => {
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

  const body = await req.json();
  const parsed = bulkDeleteDocumentsSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await documentService.bulkDelete(parsed.data);
  return apiSuccess(result);
});

