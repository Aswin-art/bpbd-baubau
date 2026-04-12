import type { Metadata } from "next";

import { getInternalSiteOrigin } from "@/lib/internal-site-url";
import { ArchiveDetailClient } from "./archive-detail-client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const origin = await getInternalSiteOrigin();
  const res = await fetch(`${origin}/api/public/archives/disasters/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return { title: "Data Tidak Ditemukan" };
  }
  const json = (await res.json()) as {
    status?: string;
    data?: {
      point?: { type: string; location: string; description?: unknown };
    };
  };
  const p = json.status === "success" ? json.data?.point : undefined;
  if (!p) {
    return { title: "Data Tidak Ditemukan" };
  }

  const desc =
    typeof p.description === "string" && p.description.trim()
      ? p.description.trim().slice(0, 160)
      : undefined;

  return {
    title: `${p.type} — ${p.location}`,
    ...(desc ? { description: desc } : {}),
  };
}

export default async function ArsipDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ArchiveDetailClient id={id} />;
}
