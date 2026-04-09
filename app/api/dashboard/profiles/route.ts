import { NextRequest } from "next/server";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { updateMyProfileSchema } from "@/modules/profiles";
import { profileService } from "@/modules/profiles/profiles.service";

export const GET = apiHandler(async () => {
  const session = await getServerSession();

  if (!session?.user) {
    throw AppError.unauthorized("Unauthorized", "UNAUTHORIZED");
  }

  if (!session.user.role) {
    throw AppError.badRequest("User role is missing", "ROLE_MISSING");
  }

  if (!(await checkPermission(session.user.role, "profile", "view"))) {
    throw AppError.forbidden("Forbidden", "FORBIDDEN");
  }

  // Allow all authenticated roles to access their personal profile.
  const data = await profileService.getMyProfile(
    session.user.id,
    session.user.role,
  );
  return apiSuccess(data);
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Unauthorized", "UNAUTHORIZED");
  }

  if (!session.user.role) {
    throw AppError.badRequest("User role is missing", "ROLE_MISSING");
  }

  if (!session.user.email) {
    throw AppError.badRequest("User email is missing", "EMAIL_MISSING");
  }

  if (!(await checkPermission(session.user.role, "profile", "update"))) {
    throw AppError.forbidden("Forbidden", "FORBIDDEN");
  }

  const body = await req.json();
  const parseResult = updateMyProfileSchema.safeParse(body);

  if (!parseResult.success) {
    throw AppError.badRequest(
      parseResult.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const data = await profileService.updateMyProfile({
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email,
    input: parseResult.data,
  });

  return apiSuccess(data);
});
