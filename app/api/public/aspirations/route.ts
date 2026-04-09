import { NextResponse } from "next/server";
import { z } from "zod";

import db from "@/lib/db";
import { getServerSession } from "@/lib/server";

const createPublicAspirationSchema = z.object({
  nama: z.string().min(3),
  kontak: z.string().min(6).optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  deskripsi: z.string().min(20),
});

function toIso(d: Date) {
  return d.toISOString();
}

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({
      requiresAuth: true,
      items: [],
      page: 1,
      perPage: 6,
      total: 0,
      totalPages: 1,
    });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const perPage = 6;

  const status = (url.searchParams.get("status") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();

  const where = {
    userId: session.user.id,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { submitterName: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.aspiration.count({ where }),
    db.aspiration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        submitterName: true,
        description: true,
        status: true,
        adminReply: true,
        repliedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return NextResponse.json({
    requiresAuth: false,
    items: rows.map((r) => ({
      id: r.id,
      submitterName: r.submitterName,
      description: r.description,
      status: r.status,
      adminReply: r.adminReply,
      repliedAt: r.repliedAt ? toIso(r.repliedAt) : null,
      createdAt: toIso(r.createdAt),
    })),
    page,
    perPage,
    total,
    totalPages,
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createPublicAspirationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const session = await getServerSession();

  const created = await db.aspiration.create({
    data: {
      submitterName: parsed.data.nama,
      description: parsed.data.deskripsi,
      status: "pending",
      userId: session?.user?.id ?? null,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

