"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
import { Download, FileText, BookMarked, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";
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
    <Wrapper className="pt-24 pb-20 md:pt-28 xl:pt-32">
      <header className="border-b-2 border-border pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
              BPBD Kota Baubau · Transparansi
            </p>
            <h1 className="mt-4 text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl md:text-[3.5rem] uppercase">
              Arsip Bencana
            </h1>
          </div>
          <p className="max-w-md text-base font-medium leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Peta kejadian bencana dan unduhan laporan PDF. Titik peta bersumber dari data
            yang dikelola di dashboard BPBD.
          </p>
        </div>
      </header>

      <section className="mt-12 lg:mt-16" aria-labelledby="arsip-map-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-secondary bg-secondary text-secondary-foreground">
              <MapPin className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <div>
              <h2
                id="arsip-map-heading"
                className="text-2xl font-black uppercase text-secondary"
              >
                Peta Kejadian
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Klik marker untuk melihat ringkasan, lalu buka detail.
              </p>
            </div>
          </div>
        </div>
        <div className="border-2 border-border bg-card p-2 sm:p-4">
          <DisasterMap />
        </div>
      </section>

      <section className="mt-20" aria-labelledby="arsip-docs-heading">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-secondary bg-secondary text-secondary-foreground">
              <BookMarked className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <div>
              <h2
                id="arsip-docs-heading"
                className="text-2xl font-black uppercase text-secondary"
              >
                Laporan PDF
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Arsip dokumen bersifat tahunan dan terpisah dari titik peta.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <ArsipFilter
              activeTahun={tahun || "semua"}
              onTahunChange={onTahunChange}
              years={yearsQuery.data?.years ?? []}
              disabled={yearsQuery.isLoading || yearsQuery.isError}
            />
            <div className="flex items-center gap-2 border-2 border-border bg-card px-4 py-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:w-[360px]">
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Cari dokumen arsip…"
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
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
                  className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Hapus
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-border pb-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {data ? `${data.total} Dokumen` : "Memuat…"}
            {totalPages > 1 ? (
              <span className="text-muted-foreground/70">
                {" "}
                · Halaman {String(current)} dari {String(totalPages)}
              </span>
            ) : null}
            {isFetching && !isLoading ? (
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary animate-pulse">
                (Memuat)
              </span>
            ) : null}
          </p>
        </div>

        {isError ? (
          (() => {
            throw new Error("Gagal memuat arsip.");
          })()
        ) : isLoading ? (
          <ArchivesSkeleton />
        ) : items.length === 0 ? (
          <div className="border-2 border-border bg-muted px-6 py-20 text-center">
            <p className="text-xl font-black tracking-tight text-secondary uppercase">
              Tidak Ada Dokumen
            </p>
            <p className="mt-2 text-base font-medium text-muted-foreground">
              Tidak ada hasil untuk filter/pencarian ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((doc, i) => {
              const idx = (current - 1) * (data?.perPage ?? 6) + i + 1;
              return (
                <div key={doc.id} className="group border-2 border-border bg-card p-6 transition-colors hover:border-primary">
                  <div className="md:grid md:grid-cols-12 md:items-start md:gap-8">
                    <div className="hidden md:col-span-1 md:flex md:pt-1">
                      <span className="font-mono text-xl font-black text-muted-foreground/50 group-hover:text-primary transition-colors">
                        {String(idx).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-3 space-y-4 md:col-span-9 md:mt-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                          Arsip {doc.year}
                        </span>
                        <span className="border-2 border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-secondary">
                          PDF
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {doc.dateLabel}
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {doc.fileSize}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black leading-snug tracking-tight text-secondary group-hover:text-primary transition-colors">
                        {doc.name}
                      </h3>

                      <p className="max-w-3xl text-base font-medium leading-relaxed text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col items-stretch gap-3 md:col-span-2 md:mt-0 md:items-end">
                      <Button
                        asChild
                        variant="default"
                        className="w-full rounded-none border-2 border-primary bg-primary font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-background hover:text-primary disabled:opacity-50 md:w-auto"
                      >
                        <a
                          href={doc.downloadUrl || "#"}
                          target={doc.downloadUrl ? "_blank" : undefined}
                          rel={doc.downloadUrl ? "noopener noreferrer" : undefined}
                          aria-label={`Unduh ${doc.name}`}
                        >
                          <Download className="mr-2 h-4 w-4" strokeWidth={2.5} />
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
            className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-border pt-8"
            aria-label="Paginasi arsip"
          >
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current <= 1}
              className={
                current > 1
                  ? "inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  : "inline-flex items-center gap-2 border-2 border-border bg-muted px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground/50 cursor-not-allowed"
              }
            >
              Sebelumnya
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p)}
                  className={
                    p === current
                      ? "flex h-10 w-10 items-center justify-center border-2 border-secondary bg-secondary font-mono text-xs font-bold text-secondary-foreground"
                      : "flex h-10 w-10 items-center justify-center border-2 border-border bg-card font-mono text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
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
                  ? "inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  : "inline-flex items-center gap-2 border-2 border-border bg-muted px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground/50 cursor-not-allowed"
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
