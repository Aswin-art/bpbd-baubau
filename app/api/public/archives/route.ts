import { NextResponse } from "next/server";
import db from "@/lib/db";

type PublicArchiveDocumentItem = {
  id: string;
  name: string;
  description: string;
  dateLabel: string;
  fileSize: string;
  year: string;
  downloadUrl: string;
  createdAt: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const perPage = 6;

  const tahun = (url.searchParams.get("tahun") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();

  const where = {
    ...(tahun ? { year: tahun } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.arsipDocument.count({ where }),
    db.arsipDocument.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        description: true,
        dateLabel: true,
        fileSize: true,
        year: true,
        downloadUrl: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const items: PublicArchiveDocumentItem[] = rows.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    dateLabel: d.dateLabel,
    fileSize: d.fileSize,
    year: d.year,
    downloadUrl: d.downloadUrl,
    createdAt: d.createdAt.toISOString(),
  }));

  return NextResponse.json({
    items,
    page,
    perPage,
    total,
    totalPages,
    ...(tahun ? { tahun } : {}),
    ...(q ? { q } : {}),
  });
}

