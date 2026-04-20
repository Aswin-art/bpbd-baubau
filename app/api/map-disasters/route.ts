import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";
import { parsePgInt32Count } from "@/lib/pg-int32";
import { getDefaultMapTypeColor, normalizeMapColor } from "@/lib/map-disaster-colors";
import { mapDisasterApiPostSchema } from "@/lib/map-disaster-zod";

function toIso(v: Date | string) {
  return v instanceof Date ? v.toISOString() : v;
}

function serializePoint(p: any) {
  return {
    ...p,
    createdAt: toIso(p.createdAt),
    updatedAt: toIso(p.updatedAt),
  };
}

/**
 * Public: GET /api/map-disasters
 * Returns both `{ points }` (legacy) and `{ status, data }` (new).
 */
export const GET = apiHandler(async (_req: NextRequest) => {
  const points = await db.mapDisasterPoint.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const data = points.map(serializePoint);
  return NextResponse.json({ status: "success", data, points: data });
});

/**
 * Dashboard: POST /api/map-disasters
 * Requires auth + permission maps:create.
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "maps", "create"))) {
    throw AppError.forbidden(
      "You don't have permission to create map points",
      "FORBIDDEN",
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) throw AppError.badRequest("Invalid payload", "VALIDATION_ERROR");

  const parsed = mapDisasterApiPostSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw AppError.badRequest(msg || "Validasi payload gagal", "VALIDATION_ERROR");
  }

  const b = parsed.data;
  const images: string[] = (b.images ?? [])
    .map((x) => String(x || "").trim())
    .filter(Boolean);
  const primaryImage =
    images[0] || String(b.image || "").trim();

  const created = await db.mapDisasterPoint.create({
    data: {
      type: b.type.trim(),
      typeColor:
        normalizeMapColor(b.typeColor) ?? getDefaultMapTypeColor(b.type.trim()),
      location: b.location.trim(),
      kecamatan: b.kecamatan.trim(),
      date: b.date.trim(),
      casualties: parsePgInt32Count(b.casualties ?? 0, "Korban jiwa"),
      displaced: parsePgInt32Count(b.displaced ?? 0, "Mengungsi"),
      description: b.description as unknown,
      image: primaryImage,
      lat: b.lat,
      lng: b.lng,
    },
  });

  // Create photo rows if available (schema: DisasterPhoto). Use `any` to avoid
  // TypeScript mismatch before prisma generate/migration is applied locally.
  if (images.length > 0) {
    await (db as any).disasterPhoto?.createMany?.({
      data: images.map((url, idx) => ({
        disasterId: created.id,
        url,
        sortOrder: idx,
      })),
      skipDuplicates: true,
    });
  }

  const data = serializePoint(created);
  return NextResponse.json({ status: "success", data }, { status: 201 });
});

