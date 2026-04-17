import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * GET /api/public/articles/categories
 * List distinct categories for published articles.
 */
export async function GET() {
  const rows = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return NextResponse.json({
    categories: rows.map((r) => r.category).filter(Boolean),
  });
}

