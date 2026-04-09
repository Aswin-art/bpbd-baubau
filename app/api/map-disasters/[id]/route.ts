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

export const GET = apiHandler(async (_req: NextRequest, context) => {
  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const point = await db.mapDisasterPoint.findUnique({ where: { id } });
  if (!point) throw AppError.notFound("Map point not found", "NOT_FOUND");

  const data = serializePoint(point);
  return NextResponse.json({ status: "success", data });
});

export const PATCH = apiHandler(async (req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "maps", "update"))) {
    throw AppError.forbidden(
      "You don't have permission to update map points",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  const body = await req.json().catch(() => null);
  if (!body) throw AppError.badRequest("Invalid payload", "VALIDATION_ERROR");

  const images: string[] = Array.isArray(body.images)
    ? body.images.map((x: unknown) => String(x || "").trim()).filter(Boolean)
    : [];

  const updated = await db.mapDisasterPoint.update({
    where: { id },
    data: {
      ...(body.type !== undefined ? { type: String(body.type).trim() } : {}),
      ...(body.location !== undefined
        ? { location: String(body.location).trim() }
        : {}),
      ...(body.kecamatan !== undefined
        ? { kecamatan: String(body.kecamatan).trim() }
        : {}),
      ...(body.date !== undefined ? { date: String(body.date).trim() } : {}),
      ...(body.casualties !== undefined
        ? { casualties: Number(body.casualties || 0) }
        : {}),
      ...(body.displaced !== undefined
        ? { displaced: Number(body.displaced || 0) }
        : {}),
      ...(body.description !== undefined ? { description: body.description as any } : {}),
      ...(body.image !== undefined
        ? { image: String(body.image).trim() }
        : images.length > 0
          ? { image: images[0] }
          : {}),
      ...(body.lat !== undefined ? { lat: Number(body.lat) } : {}),
      ...(body.lng !== undefined ? { lng: Number(body.lng) } : {}),
    },
  });

  if (Array.isArray(body.images)) {
    // Replace photos list (best-effort).
    await (db as any).disasterPhoto?.deleteMany?.({ where: { disasterId: id } });
    if (images.length > 0) {
      await (db as any).disasterPhoto?.createMany?.({
        data: images.map((url, idx) => ({
          disasterId: id,
          url,
          sortOrder: idx,
        })),
        skipDuplicates: true,
      });
    }
  }

  const data = serializePoint(updated);
  return NextResponse.json({ status: "success", data });
});

export const DELETE = apiHandler(async (_req: NextRequest, context) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "maps", "delete"))) {
    throw AppError.forbidden(
      "You don't have permission to delete map points",
      "FORBIDDEN",
    );
  }

  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id) throw AppError.badRequest("Missing id", "MISSING_ID");

  await db.mapDisasterPoint.delete({ where: { id } });
  return NextResponse.json({ status: "success", data: { id } });
});

