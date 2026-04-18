import { NextResponse } from "next/server";
import db from "@/lib/db";

function parseYearParam(raw: string): number | null {
  const t = raw.trim();
  if (!t || t === "semua") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 1900 && n <= 2100 ? n : null;
}

function yearRangeUtc(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
  return { start, end };
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const perPage = 4;

  const tag = (url.searchParams.get("tag") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const tahun = parseYearParam(url.searchParams.get("tahun") || "");

  const yearFilter =
    tahun != null
      ? (() => {
          const { start, end } = yearRangeUtc(tahun);
          return {
            OR: [
              { publishedAt: { gte: start, lt: end } },
              {
                AND: [{ publishedAt: null }, { createdAt: { gte: start, lt: end } }],
              },
            ],
          };
        })()
      : null;

  const where = {
    AND: [
      { status: "PUBLISHED" as const },
      ...(tag ? [{ category: tag }] : []),
      ...(q
        ? [
            {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { excerpt: { contains: q, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
      ...(yearFilter ? [yearFilter] : []),
    ],
  };

  const [total, rows] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnailUrl: true,
        category: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return NextResponse.json({
    items: rows.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? "",
      category: a.category,
      imageUrl: a.thumbnailUrl ?? "/images/hero-2.avif",
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      dateLabel: formatDateLabel(a.publishedAt ?? a.createdAt),
    })),
    page,
    perPage,
    total,
    totalPages,
    ...(tag ? { tag } : {}),
    ...(q ? { q } : {}),
    ...(tahun != null ? { tahun: String(tahun) } : {}),
  });
}

