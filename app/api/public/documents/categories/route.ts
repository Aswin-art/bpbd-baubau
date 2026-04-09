import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = await db.document.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const categories = rows
    .map((r) => r.category)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ categories });
}

