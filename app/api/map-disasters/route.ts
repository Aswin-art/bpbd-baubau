import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";

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

  const images: string[] = Array.isArray(body.images)
    ? body.images.map((x: unknown) => String(x || "").trim()).filter(Boolean)
    : [];

  const created = await db.mapDisasterPoint.create({
    data: {
      type: String(body.type || "").trim(),
      location: String(body.location || "").trim(),
      kecamatan: String(body.kecamatan || "").trim(),
      date: String(body.date || "").trim(),
      casualties: Number(body.casualties || 0),
      displaced: Number(body.displaced || 0),
      description: body.description as any,
      image: images[0] || String(body.image || "").trim(),
      lat: Number(body.lat),
      lng: Number(body.lng),
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

