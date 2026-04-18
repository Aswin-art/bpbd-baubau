import { NextResponse } from "next/server";
import db from "@/lib/db";

function addYear(set: Set<string>, y: number) {
  if (y >= 1900 && y <= 2100) set.add(String(y));
}

function addYearsFromDateLabel(set: Set<string>, value: string) {
  const matches = value.match(/\b(19|20)\d{2}\b/g) ?? [];
  for (const year of matches) {
    set.add(year);
  }
}

/** Tahun unik dari berita, dokumen, dan arsip — disesuaikan dengan data yang benar-benar ada. */
export async function GET() {
  const set = new Set<string>();

  const [articles, documents, archiveRows] = await Promise.all([
    db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { publishedAt: true, createdAt: true },
    }),
    db.document.findMany({
      select: { dateLabel: true },
    }),
    db.arsipDocument.findMany({
      select: { year: true },
      distinct: ["year"],
    }),
  ]);

  for (const a of articles) {
    const d = a.publishedAt ?? a.createdAt;
    addYear(set, d.getFullYear());
  }
  for (const d of documents) {
    addYearsFromDateLabel(set, d.dateLabel);
  }
  for (const r of archiveRows) {
    const t = (r.year || "").trim();
    if (/^\d{4}$/.test(t)) set.add(t);
  }

  const years = Array.from(set).sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true }),
  );

  return NextResponse.json({ years });
}
