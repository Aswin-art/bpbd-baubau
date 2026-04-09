import { NextResponse } from "next/server";
import { publicNewsService } from "@/modules/public/news";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit")) || 5, 20));

  const data = await publicNewsService.listLatest({ limit });
  return NextResponse.json(data);
}

