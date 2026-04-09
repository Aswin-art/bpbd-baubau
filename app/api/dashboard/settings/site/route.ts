import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { settingsService, updateSiteSettingsSchema } from "@/modules/settings";

export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "read"))) {
    throw AppError.forbidden("You don't have permission to view settings", "FORBIDDEN");
  }

  const data = await settingsService.getSiteSettings();
  return apiSuccess(data);
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "update"))) {
    throw AppError.forbidden("You don't have permission to update settings", "FORBIDDEN");
  }

  const body = await req.json();
  const parsed = updateSiteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload", "VALIDATION_ERROR");
  }

  const updated = await settingsService.updateSiteSettings(parsed.data);
  return apiSuccess(updated);
});

