import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { reorderHeroSlidesSchema, settingsService } from "@/modules/settings";

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "update"))) {
    throw AppError.forbidden("You don't have permission to update settings", "FORBIDDEN");
  }

  const body = await req.json();
  const parsed = reorderHeroSlidesSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload", "VALIDATION_ERROR");
  }

  const slides = await settingsService.reorderHeroSlides(parsed.data);
  return apiSuccess(slides);
});

