import { NextResponse } from "next/server";
import db from "@/lib/db";

function parseYearParam(raw: string): number | null {
  const t = raw.trim();
  if (!t || t === "semua") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 1900 && n <= 2100 ? n : null;
}

type PublicDocumentItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  fileSize: string;
  downloadUrl: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const perPage = 6;

  const kategori = (url.searchParams.get("kategori") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const tahun = parseYearParam(url.searchParams.get("tahun") || "");

  const yearDateLabel =
    tahun != null
      ? { dateLabel: { contains: String(tahun), mode: "insensitive" as const } }
      : null;

  const andParts = [
    ...(kategori ? [{ category: kategori }] : []),
    ...(q
      ? [
          {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          },
        ]
      : []),
    ...(yearDateLabel ? [yearDateLabel] : []),
  ];

  const where = andParts.length > 0 ? { AND: andParts } : {};

  const [total, rows] = await Promise.all([
    db.document.count({ where }),
    db.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        dateLabel: true,
        fileSize: true,
        downloadUrl: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const items: PublicDocumentItem[] = rows.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    category: d.category,
    date: d.dateLabel,
    fileSize: d.fileSize,
    downloadUrl: d.downloadUrl,
  }));

  return NextResponse.json({
    items,
    page,
    perPage,
    total,
    totalPages,
    ...(kategori ? { kategori } : {}),
    ...(q ? { q } : {}),
    ...(tahun != null ? { tahun: String(tahun) } : {}),
  });
}

