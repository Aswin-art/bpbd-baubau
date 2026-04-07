import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server";
import { mapRowToDto } from "@/lib/map-disaster-db";
import { mapDisasterCreateSchema } from "@/lib/map-disaster-zod";
import { prisma } from "@/lib/db";
import { disasterPoints } from "@/data/dummy-data";

export async function GET() {
  try {
    const rows = await prisma.mapDisasterPoint.findMany({
      orderBy: { updatedAt: "desc" },
    });
    // For public pages: if DB is empty, return dummy points so the map has pins.
    const points = rows.length > 0 ? rows.map(mapRowToDto) : disasterPoints;
    return NextResponse.json({ points });
  } catch {
    // If DB is not available, still return dummy points for public map rendering.
    return NextResponse.json({ points: disasterPoints });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mapDisasterCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = await prisma.mapDisasterPoint.create({
    data: {
      id: randomUUID(),
      ...parsed.data,
    },
  });

  return NextResponse.json({ point: mapRowToDto(row) }, { status: 201 });
}
