import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = await db.arsipDocument.findMany({
    select: { year: true },
    distinct: ["year"],
  });

  const years = rows
    .map((r) => r.year)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  return NextResponse.json({ years });
}

