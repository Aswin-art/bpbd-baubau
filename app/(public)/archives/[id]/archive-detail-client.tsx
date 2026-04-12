"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";
import type { PublicArchiveDisasterDetail } from "@/lib/public-archive-disaster-detail";
import { ArchiveDisasterDescription } from "./archive-disaster-description";
import { ArchiveDisasterGallery } from "./archive-disaster-gallery";
import {
  ArchiveDetailErrorFallback,
  ArchiveDetailSkeleton,
} from "./archive-detail-fallback";

const typeColors: Record<string, string> = {
  Banjir: "bg-blue-600",
  "Tanah Longsor": "bg-amber-500",
  "Angin Puting Beliung": "bg-purple-600",
  Kebakaran: "bg-red-600",
  "Gelombang Tinggi": "bg-cyan-600",
};

const typeBgColors: Record<string, string> = {
  Banjir: "bg-blue-50 text-blue-700",
  "Tanah Longsor": "bg-amber-50 text-amber-700",
  "Angin Puting Beliung": "bg-purple-50 text-purple-700",
  Kebakaran: "bg-red-50 text-red-700",
  "Gelombang Tinggi": "bg-cyan-50 text-cyan-700",
};

export class ArchiveDetailNotFoundError extends Error {
  name = "ArchiveDetailNotFoundError";
  constructor() {
    super("Data tidak ditemukan.");
  }
}

async function fetchArchiveDisasterDetail(
  id: string,
): Promise<PublicArchiveDisasterDetail> {
  const res = await fetch(`/api/public/archives/disasters/${id}`, {
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    status?: string;
    message?: string;
    data?: PublicArchiveDisasterDetail;
  } | null;

  if (res.status === 404) {
    throw new ArchiveDetailNotFoundError();
  }
  if (!res.ok || json?.status !== "success" || !json.data) {
    throw new Error(json?.message || "Gagal memuat data arsip.");
  }
  return json.data;
}

export function ArchiveDetailClient({ id }: { id: string }) {
  return (
    <ErrorBoundary FallbackComponent={ArchiveDetailErrorFallback}>
      <ArchiveDetailClientInner id={id} />
    </ErrorBoundary>
  );
}

function ArchiveDetailClientInner({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["public-archive-disaster-detail", id],
    queryFn: () => fetchArchiveDisasterDetail(id),
  });

  if (isLoading) {
    return <ArchiveDetailSkeleton />;
  }

  if (isError) {
    if (error instanceof ArchiveDetailNotFoundError) {
      return (
        <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
          <div className="max-w-lg space-y-4">
            <h1 className="text-2xl font-bold text-secondary">Data tidak ditemukan</h1>
            <p className="text-sm text-muted-foreground">
              Titik bencana ini tidak ada atau telah dihapus.
            </p>
            <Button asChild variant="outline">
              <Link href="/archives">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Arsip
              </Link>
            </Button>
          </div>
        </Wrapper>
      );
    }
    return (
      <ArchiveDetailErrorFallback
        error={error instanceof Error ? error : new Error("Unknown error")}
        resetErrorBoundary={() => void refetch()}
      />
    );
  }

  if (!data) {
    return <ArchiveDetailSkeleton />;
  }

  const r = data.point;
  const relatedDocs = data.relatedDocuments;
  const relatedMapPoints = data.relatedMapPoints;

  const stats = [
    ...(r.casualties > 0
      ? [{ label: "Korban Jiwa", value: r.casualties, accent: true }]
      : []),
    ...(r.displaced > 0
      ? [{ label: "Warga Mengungsi", value: r.displaced, accent: false }]
      : []),
  ];

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <Link
        href="/archives"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Arsip
      </Link>

      <div className="relative rounded-2xl overflow-hidden mb-10">
        <div className="aspect-21/9 sm:aspect-3/1 relative">
          <Image
            src={r.image}
            alt={r.type}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <Badge
            className={`${typeColors[r.type] || "bg-gray-600"} text-white text-[10px] font-bold uppercase tracking-wider border-0 mb-3`}
          >
            {r.type}
          </Badge>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight max-w-3xl">
            {r.location}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {r.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Kecamatan {r.kecamatan}
            </span>
          </div>

          {stats.length > 0 && (
            <div className="flex gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-xl border border-border p-5"
                >
                  <p
                    className={`text-3xl font-black tabular-nums ${s.accent ? "text-red-600" : "text-foreground"}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              Kronologi Kejadian
            </h2>
            <ArchiveDisasterDescription value={r.description} />
          </section>

          <ArchiveDisasterGallery point={r} />

          {(r.casualties > 0 || r.displaced > 0) && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary" />
                Korban & pengungsian
              </h2>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Kategori
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-foreground font-medium">
                        Korban Jiwa
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold tabular-nums ${r.casualties > 0 ? "text-red-600" : "text-foreground"}`}
                      >
                        {r.casualties > 0 ? r.casualties : "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground font-medium">
                        Warga Mengungsi
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">
                        {r.displaced > 0 ? `${r.displaced} jiwa` : "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {relatedDocs.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary" />
                Dokumen Laporan Bencana
              </h2>
              <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
                Arsip laporan bersifat tahunan dan terpisah dari data titik peta
                bencana (CRUD di dashboard).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">
                          {doc.dateLabel}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] text-muted-foreground">
                          {doc.fileSize}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 ml-auto text-[11px] text-primary hover:text-primary hover:bg-primary/10"
                          asChild
                        >
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Unduh
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div
            className={`rounded-xl p-5 ${typeBgColors[r.type] || "bg-gray-50 text-gray-700"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Ringkasan
              </h3>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="opacity-70">Jenis</dt>
                <dd className="font-semibold">{r.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="opacity-70">Tanggal</dt>
                <dd className="font-semibold">{r.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="opacity-70">Kecamatan</dt>
                <dd className="font-semibold">{r.kecamatan}</dd>
              </div>
              {r.casualties > 0 && (
                <div className="flex justify-between">
                  <dt className="opacity-70">Korban</dt>
                  <dd className="font-bold">{r.casualties}</dd>
                </div>
              )}
              {r.displaced > 0 && (
                <div className="flex justify-between">
                  <dt className="opacity-70">Mengungsi</dt>
                  <dd className="font-bold">{r.displaced}</dd>
                </div>
              )}
            </dl>
          </div>

          {relatedDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Dokumen Terkait
                </h3>
              </div>
              <div className="space-y-3">
                {relatedDocs.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-start gap-3 rounded-xl border border-border p-3.5 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {doc.fileSize}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                      asChild
                    >
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Unduh ${doc.name}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Lainnya
              </h3>
            </div>
            <div className="space-y-2">
              {relatedMapPoints.map((row) => (
                <Link
                  key={row.id}
                  href={`/archives/${row.id}`}
                  className="group flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="relative w-14 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={row.image}
                      alt={row.type}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                      {row.type} — {row.kecamatan}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{row.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Wrapper>
  );
}
