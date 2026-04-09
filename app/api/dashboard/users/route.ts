import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  bulkDeleteUsersSchema,
  bulkSetActiveSchema,
  createUserSchema,
  userListParamsSchema,
  usersService,
} from "@/modules/users";

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "users", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view users",
      "FORBIDDEN",
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = userListParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    q: (searchParams.get("q") || "").trim() || undefined,
    role: (searchParams.get("role") || "").trim() || undefined,
    isActive:
      searchParams.get("isActive") !== null
        ? searchParams.get("isActive")
        : undefined,
  });

  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await usersService.list(parsed.data);
  return apiSuccess(result);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "users", "create"))) {
    throw AppError.forbidden(
      "You don't have permission to create users",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const created = await usersService.create(parsed.data);
  return apiSuccess(created, 201);
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "users", "ban"))) {
    throw AppError.forbidden(
      "You don't have permission to change user status",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = bulkSetActiveSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await usersService.bulkSetActive(parsed.data);
  return apiSuccess(result);
});

export const DELETE = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "users", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete users",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = bulkDeleteUsersSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await usersService.bulkDelete(parsed.data);
  return apiSuccess(result);
});

