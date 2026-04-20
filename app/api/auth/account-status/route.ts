import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import db from "@/lib/db";

/**
 * GET /api/auth/account-status
 * Status akun dari database (bukan hanya payload session).
 */
export const GET = apiHandler(async () => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw AppError.unauthorized("Belum masuk", "UNAUTHORIZED");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, banned: true },
  });

  if (!user) {
    throw AppError.unauthorized("Pengguna tidak ditemukan", "UNAUTHORIZED");
  }

  return apiSuccess({
    isActive: user.isActive,
    banned: user.banned,
    allowed: user.isActive === true && user.banned !== true,
  });
});
