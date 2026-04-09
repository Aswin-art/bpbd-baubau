import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  createHeroSlideSchema,
  heroSlideListParamsSchema,
  settingsService,
} from "@/modules/settings";

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "read"))) {
    throw AppError.forbidden("You don't have permission to view settings", "FORBIDDEN");
  }

  const { searchParams } = new URL(req.url);
  const parsed = heroSlideListParamsSchema.safeParse({
    includeInactive: searchParams.get("includeInactive") ?? undefined,
  });
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload", "VALIDATION_ERROR");
  }

  const slides = await settingsService.listHeroSlides(parsed.data);
  return apiSuccess(slides);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");

  if (!(await checkPermission(session.user.role, "settings", "update"))) {
    throw AppError.forbidden("You don't have permission to update settings", "FORBIDDEN");
  }

  const body = await req.json();
  const parsed = createHeroSlideSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.issues[0]?.message || "Invalid payload", "VALIDATION_ERROR");
  }

  const created = await settingsService.createHeroSlide(parsed.data);
  return apiSuccess(created, 201);
});

