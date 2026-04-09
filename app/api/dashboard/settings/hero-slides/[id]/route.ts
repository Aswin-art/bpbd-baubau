import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { settingsService, updateHeroSlideSchema } from "@/modules/settings";

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "update"))) {
    throw AppError.forbidden("You don't have permission to update settings", "FORBIDDEN");
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const body = await req.json();
  const parsed = updateHeroSlideSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload", "VALIDATION_ERROR");
  }

  const updated = await settingsService.updateHeroSlide(id, parsed.data);
  return apiSuccess(updated);
});

export const DELETE = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "update"))) {
    throw AppError.forbidden("You don't have permission to update settings", "FORBIDDEN");
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const result = await settingsService.deleteHeroSlide(id);
  return apiSuccess(result);
});

