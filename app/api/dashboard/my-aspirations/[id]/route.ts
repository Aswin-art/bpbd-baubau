import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { myAspirationUpdateSchema } from "@/modules/aspirations";
import { aspirationCitizenService } from "@/modules/aspirations/aspirations-citizen.service";

export const GET = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "my_aspirations", "read"))) {
    throw AppError.forbidden("Anda tidak memiliki akses.", "FORBIDDEN");
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const row = await aspirationCitizenService.getById(session.user.id, id);
  return apiSuccess(row);
});

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "my_aspirations", "update"))) {
    throw AppError.forbidden("Anda tidak memiliki izin mengubah aspirasi.", "FORBIDDEN");
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const body = await req.json();
  const parsed = myAspirationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const updated = await aspirationCitizenService.update(
    session.user.id,
    id,
    parsed.data,
  );
  return apiSuccess(updated);
});

export const DELETE = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "my_aspirations", "delete"))) {
    throw AppError.forbidden("Anda tidak memiliki izin menghapus aspirasi.", "FORBIDDEN");
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const result = await aspirationCitizenService.delete(session.user.id, id);
  return apiSuccess(result);
});
