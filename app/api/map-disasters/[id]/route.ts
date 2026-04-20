import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import db from "@/lib/db";
import { parsePgInt32Count } from "@/lib/pg-int32";
import { normalizeMapColor } from "@/lib/map-disaster-colors";
import { mapDisasterApiPatchSchema } from "@/lib/map-disaster-zod";

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

  const parsed = mapDisasterApiPatchSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw AppError.badRequest(msg || "Validasi payload gagal", "VALIDATION_ERROR");
  }

  const b = parsed.data;
  const images: string[] = Array.isArray(b.images)
    ? b.images.map((x) => String(x || "").trim()).filter(Boolean)
    : [];

  const updated = await db.mapDisasterPoint.update({
    where: { id },
    data: {
      ...(b.type !== undefined ? { type: b.type.trim() } : {}),
      ...(b.typeColor !== undefined ? { typeColor: normalizeMapColor(b.typeColor) } : {}),
      ...(b.location !== undefined ? { location: b.location.trim() } : {}),
      ...(b.kecamatan !== undefined ? { kecamatan: b.kecamatan.trim() } : {}),
      ...(b.date !== undefined ? { date: b.date.trim() } : {}),
      ...(b.casualties !== undefined
        ? { casualties: parsePgInt32Count(b.casualties, "Korban jiwa") }
        : {}),
      ...(b.displaced !== undefined
        ? { displaced: parsePgInt32Count(b.displaced, "Mengungsi") }
        : {}),
      ...(b.description !== undefined ? { description: b.description as unknown } : {}),
      ...(b.image !== undefined
        ? { image: String(b.image).trim() }
        : images.length > 0
          ? { image: images[0] }
          : {}),
      ...(b.lat !== undefined ? { lat: b.lat } : {}),
      ...(b.lng !== undefined ? { lng: b.lng } : {}),
    },
  });

  if (Array.isArray(b.images)) {
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

