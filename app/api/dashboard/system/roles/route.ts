import { NextRequest } from "next/server";
import { z } from "zod";

import db from "@/lib/db";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";

const ROLE_META = [
  {
    id: "admin",
    name: "Admin",
    description: "Akses penuh untuk mengelola seluruh modul dan pengaturan sistem.",
  },
  {
    id: "operator",
    name: "Operator",
    description:
      "Operasional harian: kelola konten (artikel, dokumen, arsip, peta) dan data aspirasi.",
  },
  {
    id: "kepala_bpbd",
    name: "Kepala BPBD",
    description:
      "Akses baca untuk monitoring dan publikasi; dapat mengubah status aspirasi.",
  },
  {
    id: "masyarakat",
    name: "Masyarakat",
    description: "Pengguna portal: akses baca konten publik dan pengajuan aspirasi.",
  },
] as const;

const roleListQuerySchema = z.object({
  includePermissions: z
    .enum(["0", "1"])
    .optional()
    .transform((v) => v === "1"),
});

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "permissions", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to read permissions",
      "FORBIDDEN",
    );
  }

  const parsed = roleListQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!parsed.success) {
    throw AppError.badRequest("Invalid query params", "VALIDATION_ERROR");
  }

  const includePermissions = parsed.data.includePermissions ?? true;

  const userCounts = await db.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  const userCountMap = new Map(
    userCounts.map((r) => [String(r.role).toLowerCase(), r._count._all]),
  );

  const permsByRole = new Map<
    string,
    { resource: string; actions: string[] }[]
  >();

  if (includePermissions) {
    const rows = await db.rolePermission.findMany({
      select: { role: true, resource: true, actions: true },
      orderBy: [{ role: "asc" }, { resource: "asc" }],
    });

    for (const row of rows) {
      if (String(row.resource).toLowerCase() === "user") continue;
      const actions = (row.actions as string[]) ?? [];
      if (actions.length === 0) continue;
      const key = String(row.role).toLowerCase();
      const current = permsByRole.get(key) ?? [];
      current.push({
        resource: row.resource,
        actions,
      });
      permsByRole.set(key, current);
    }
  }

  const roles = ROLE_META.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    userCount: userCountMap.get(r.id) ?? 0,
    permissions: includePermissions ? permsByRole.get(r.id) ?? [] : [],
  }));

  return apiSuccess({ roles });
});

