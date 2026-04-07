import { NextResponse } from "next/server";
import { newsArticles } from "@/data/dummy-data";

const PER_PAGE = 4;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hal = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const tag = (url.searchParams.get("tag") || "").trim();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  // Simulate network/API latency (small).
  await new Promise((r) => setTimeout(r, 150));

  let filtered = newsArticles;

  if (tag && tag !== "semua") {
    filtered = filtered.filter((n) => n.category === tag);
  }

  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(hal, totalPages);
  const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return NextResponse.json({
    items,
    page,
    perPage: PER_PAGE,
    total,
    totalPages,
    tag: tag || "semua",
    q: q || "",
  });
}

