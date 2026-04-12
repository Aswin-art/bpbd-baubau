import { NextResponse } from "next/server";

import { getPublicArchiveDisasterDetail } from "@/lib/public-archive-disaster-detail";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await getPublicArchiveDisasterDetail(id);
  if (!data) {
    return NextResponse.json(
      { status: "error", message: "Data tidak ditemukan.", code: "NOT_FOUND" },
      { status: 404 },
    );
  }
  return NextResponse.json({ status: "success", data });
}
