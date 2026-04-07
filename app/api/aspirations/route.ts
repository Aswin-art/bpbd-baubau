import { NextResponse } from "next/server";
import { aspirations } from "@/data/dummy-data";

const PER_PAGE = 6;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hal = Math.max(1, Number(url.searchParams.get("hal")) || 1);
  const status = (url.searchParams.get("status") || "").trim();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  await new Promise((r) => setTimeout(r, 150));

  let filtered = aspirations;
  if (status && status !== "semua") {
    filtered = filtered.filter((a) => a.status === status);
  }
  if (q) {
    filtered = filtered.filter(
      (a) =>
        a.submitterName.toLowerCase().includes(q) ||
        a.description.text.toLowerCase().includes(q),
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
    status: status || "semua",
    q: q || "",
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Partial<{
    nama: string;
    kontak: string;
    deskripsi: string;
    imageUrl?: string;
  }>;

  if (!data?.nama || !data?.kontak || !data?.deskripsi) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  // Simulate save (no persistence).
  await new Promise((r) => setTimeout(r, 500));

  return NextResponse.json(
    {
      item: {
        id: `asp-${Date.now()}`,
        submitterName: data.nama,
        description: {
          text: data.deskripsi,
          ...(data.imageUrl?.trim() ? { imageUrl: data.imageUrl.trim() } : {}),
        },
        status: "pending",
        userId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}

