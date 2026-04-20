import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import {
  aspirationListParamsSchema,
  myAspirationCreateSchema,
} from "@/modules/aspirations";
import { aspirationCitizenService } from "@/modules/aspirations/aspirations-citizen.service";

/**
 * GET /api/dashboard/my-aspirations
 * Hanya aspirasi milik pengguna yang sedang masuk.
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "my_aspirations", "read"))) {
    throw AppError.forbidden(
      "Anda tidak memiliki akses ke daftar aspirasi ini.",
      "FORBIDDEN",
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = aspirationListParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    q: (searchParams.get("q") || "").trim() || undefined,
    status: (searchParams.get("status") || "").trim() || undefined,
  });

  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const result = await aspirationCitizenService.list(session.user.id, parsed.data);
  return apiSuccess(result);
});

/**
 * POST /api/dashboard/my-aspirations
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "my_aspirations", "create"))) {
    throw AppError.forbidden(
      "Anda tidak memiliki izin untuk membuat aspirasi.",
      "FORBIDDEN",
    );
  }

  const body = await req.json();
  const parsed = myAspirationCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(
      parsed.error.issues[0]?.message || "Invalid payload",
      "VALIDATION_ERROR",
    );
  }

  const created = await aspirationCitizenService.create(session.user.id, parsed.data);
  return apiSuccess(created, 201);
});
