"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
import { Download, FileText, BookMarked, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";
import { disasterPoints } from "@/data/dummy-data";
import { ArsipFilter } from "./arsip-filter";
import { DisasterMap } from "./disaster-map";
import { ArchivesErrorFallback, ArchivesSkeleton } from "./archives-fallback";

type PublicArchiveDocumentItem = {
  id: string;
  name: string;
  description: string;
  dateLabel: string;
  fileSize: string;
  year: string;
  downloadUrl: string;
  createdAt: string;
};

type ArchivesApiResponse = {
  items: PublicArchiveDocumentItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  tahun?: string;
  q?: string;
};

type ArchiveYearsResponse = {
  years: string[];
};

async function fetchArchives(params: {
  page: number;
  tahun: string;
  q: string;
}): Promise<ArchivesApiResponse> {
  const qs = new URLSearchParams();
  if (params.page > 1) qs.set("hal", String(params.page));
  if (params.tahun && params.tahun !== "semua") qs.set("tahun", params.tahun);
  if (params.q) qs.set("q", params.q);
  const res = await fetch(`/api/public/archives?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat arsip.");
  return res.json();
}

async function fetchArchiveYears(): Promise<ArchiveYearsResponse> {
  const res = await fetch("/api/public/archives/years", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat tahun arsip.");
  return res.json();
}

export function ArchivesClient() {
  return (
    <ErrorBoundary FallbackComponent={ArchivesErrorFallback}>
      <Suspense fallback={<ArchivesSkeleton />}>
        <ArchivesClientInner />
      </Suspense>
    </ErrorBoundary>
  );
}

function ArchivesClientInner() {
  const [page, setPage] = useQueryState("hal", parseAsInteger.withDefault(1));
  const [tahun, setTahun] = useQueryState("tahun", parseAsString.withDefault("semua"));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));

  const [qInput, setQInput] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = qInput.trim();
      void setQ(next ? next : null);
      void setPage(null);
    }, 350);
    return () => clearTimeout(t);
  }, [qInput, setQ, setPage]);

  useEffect(() => {
    setQInput(q);
  }, [q]);

  const yearsQuery = useQuery({
    queryKey: ["public-archives-years"],
    queryFn: fetchArchiveYears,
  });

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["public-archives", page, tahun, q],
    queryFn: () => fetchArchives({ page, tahun, q }),
  });

  const totalPages = data?.totalPages ?? 1;
  const current = data?.page ?? page;
  const items = data?.items ?? [];

  const goTo = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    void setPage(next === 1 ? null : next);
  };

  const onTahunChange = (next: string) => {
    void setTahun(next === "semua" ? null : next);
    void setPage(null);
  };

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <header>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              BPBD Kota Baubau · Transparansi
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
              Arsip
              <span className="mt-1 block text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                bencana
              </span>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Peta kejadian bencana dan unduhan laporan PDF. Data peta menampilkan beberapa
            titik contoh agar mudah dipahami.
          </p>
        </div>
      </header>

      <section className="mt-12 lg:mt-16" aria-labelledby="arsip-map-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h2
                id="arsip-map-heading"
                className="text-base font-semibold text-foreground tracking-tight"
              >
                Peta kejadian
              </h2>
              <p className="text-xs text-muted-foreground">
                Klik marker untuk melihat ringkasan, lalu buka detail.
              </p>
            </div>
          </div>
        </div>
        <DisasterMap records={disasterPoints} />
      </section>

      <section className="mt-14" aria-labelledby="arsip-docs-heading">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookMarked className="h-4 w-4" />
            </span>
            <div>
              <h2
                id="arsip-docs-heading"
                className="text-base font-semibold text-foreground tracking-tight"
              >
                Laporan PDF
              </h2>
              <p className="text-xs text-muted-foreground">
                Arsip dokumen bersifat tahunan dan terpisah dari titik peta.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <ArsipFilter
              activeTahun={tahun || "semua"}
              onTahunChange={onTahunChange}
              years={yearsQuery.data?.years ?? []}
              disabled={yearsQuery.isLoading || yearsQuery.isError}
            />
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3.5 py-2 sm:w-[360px]">
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Cari dokumen arsip…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Cari arsip"
              />
              {qInput.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setQInput("");
                    void setQ(null);
                    void setPage(null);
                  }}
                  className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
                >
                  hapus
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} dokumen` : "Memuat…"}
          {totalPages > 1 ? (
            <span className="text-muted-foreground/70">
              {" "}
              · halaman {String(current)} dari {String(totalPages)}
            </span>
          ) : null}
          {isFetching && !isLoading ? (
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              memuat
            </span>
          ) : null}
        </p>

        {isError ? (
          (() => {
            throw new Error("Gagal memuat arsip.");
          })()
        ) : isLoading ? (
          <ArchivesSkeleton />
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-muted/40 px-6 py-16 text-center">
            <p className="text-base font-semibold tracking-tight text-secondary">
              Tidak ada dokumen
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada hasil untuk filter/pencarian ini.
            </p>
          </div>
        ) : (
          <div className="mt-10 border-t border-border/70">
            {items.map((doc, i) => {
              const idx = (current - 1) * (data?.perPage ?? 6) + i + 1;
              return (
                <div key={doc.id} className="border-b border-border/70 py-7 md:py-8">
                  <div className="grid gap-4 md:grid-cols-12 md:gap-8">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground md:col-span-1 md:pt-0.5">
                      {String(idx).padStart(2, "0")}
                    </span>
                    <div className="space-y-2 md:col-span-9">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold tabular-nums"
                        >
                          Arsip {doc.year}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-0 bg-muted text-secondary text-[10px] font-semibold uppercase tracking-wider"
                        >
                          PDF
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {doc.dateLabel} · {doc.fileSize}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold leading-snug tracking-tight text-secondary">
                        {doc.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>

                    <div className="md:col-span-2 md:justify-self-end">
                      <Button asChild variant="outline" className="w-full md:w-auto">
                        <a
                          href={doc.downloadUrl || "#"}
                          target={doc.downloadUrl ? "_blank" : undefined}
                          rel={doc.downloadUrl ? "noopener noreferrer" : undefined}
                          aria-label={`Unduh ${doc.name}`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Unduh
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            className="mt-16 flex flex-wrap items-center justify-end gap-3 sm:gap-4"
            aria-label="Paginasi arsip"
          >
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current <= 1}
              className={
                current > 1
                  ? "inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
                  : "inline-flex items-center gap-2 text-sm text-muted-foreground/50"
              }
            >
              Sebelumnya
            </button>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p)}
                  className={
                    p === current
                      ? "flex min-h-9 min-w-9 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground"
                      : "flex min-h-9 min-w-9 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  }
                  aria-current={p === current ? "page" : undefined}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(current + 1)}
              disabled={current >= totalPages}
              className={
                current < totalPages
                  ? "inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
                  : "inline-flex items-center gap-2 text-sm text-muted-foreground/50"
              }
            >
              Selanjutnya
            </button>
          </nav>
        ) : null}

        <div className="sr-only">
          <FileText />
        </div>
      </section>
    </Wrapper>
  );
}

