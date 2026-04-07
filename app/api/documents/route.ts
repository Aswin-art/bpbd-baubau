import { NextResponse } from "next/server";
import { documents } from "@/data/dummy-data";

const PER_PAGE = 6;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hal = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const kategori = (url.searchParams.get("kategori") || "").trim();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  // Simulate API latency.
  await new Promise((r) => setTimeout(r, 150));

  let filtered = documents;
  if (kategori && kategori !== "semua") {
    filtered = filtered.filter((d) => d.category === kategori);
  }
  if (q) {
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
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
    kategori: kategori || "semua",
    q: q || "",
  });
}

