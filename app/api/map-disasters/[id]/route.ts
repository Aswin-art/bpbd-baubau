import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server";
import { mapRowToDto } from "@/lib/map-disaster-db";
import { mapDisasterUpdateSchema } from "@/lib/map-disaster-zod";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await prisma.mapDisasterPoint.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ point: mapRowToDto(row) });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mapDisasterUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  try {
    const row = await prisma.mapDisasterPoint.update({
      where: { id },
      data,
    });
    return NextResponse.json({ point: mapRowToDto(row) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  try {
    await prisma.mapDisasterPoint.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
