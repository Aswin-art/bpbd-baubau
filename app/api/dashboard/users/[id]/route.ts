import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { updateUserSchema, usersService } from "@/modules/users";

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  const canBan = await checkPermission(session.user.role, "users", "ban");
  const canUpdate = await checkPermission(session.user.role, "users", "update");
  if (!canBan && !canUpdate) {
    throw AppError.forbidden(
      "You don't have permission to update users",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const wantsActiveChange = parsed.data.isActive !== undefined;
  const updateFields = { ...parsed.data };
  delete updateFields.isActive;
  const wantsUpdateFields = Object.values(updateFields).some(
    (value) => value !== undefined,
  );

  if (wantsActiveChange && !canBan) {
    throw AppError.forbidden(
      "You don't have permission to change user status",
      "FORBIDDEN",
    );
  }
  if (wantsUpdateFields && !canUpdate) {
    throw AppError.forbidden(
      "You don't have permission to update users",
      "FORBIDDEN",
    );
  }

  const updated = await usersService.update(id, parsed.data);
  return apiSuccess(updated);
});

export const DELETE = apiHandler(async (_req: NextRequest, context) => {
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

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const result = await usersService.delete(id);
  return apiSuccess(result);
});

