"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
import { Download, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";
import { categoryLabels } from "@/data/dummy-data";
import { DocumentsErrorFallback, DocumentsSkeleton } from "./documents-fallback";
import { DocumentFilter } from "./document-filter";

type PublicDocumentItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  fileSize: string;
  downloadUrl: string;
};

type DocumentsApiResponse = {
  items: PublicDocumentItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  kategori?: string;
  q?: string;
};

type DocumentCategoriesResponse = {
  categories: string[];
};

async function fetchDocuments(params: {
  page: number;
  kategori: string;
  q: string;
}): Promise<DocumentsApiResponse> {
  const qs = new URLSearchParams();
  if (params.page > 1) qs.set("hal", String(params.page));
  if (params.kategori && params.kategori !== "semua") qs.set("kategori", params.kategori);
  if (params.q) qs.set("q", params.q);
  const res = await fetch(`/api/public/documents?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat dokumen.");
  return res.json();
}

async function fetchDocumentCategories(): Promise<DocumentCategoriesResponse> {
  const res = await fetch("/api/public/documents/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat kategori dokumen.");
  return res.json();
}

export function DocumentsClient() {
  return (
    <ErrorBoundary FallbackComponent={DocumentsErrorFallback}>
      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsClientInner />
      </Suspense>
    </ErrorBoundary>
  );
}

function DocumentsClientInner() {
  const [page, setPage] = useQueryState("hal", parseAsInteger.withDefault(1));
  const [kategori, setKategori] = useQueryState(
    "kategori",
    parseAsString.withDefault("semua"),
  );
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

  const categoriesQuery = useQuery({
    queryKey: ["public-document-categories"],
    queryFn: fetchDocumentCategories,
  });

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["public-documents", page, kategori, q],
    queryFn: () => fetchDocuments({ page, kategori, q }),
  });

  const totalPages = data?.totalPages ?? 1;
  const current = data?.page ?? page;
  const items = data?.items ?? [];

  const goTo = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    void setPage(next === 1 ? null : next);
  };

  const onCategoryChange = (next: string) => {
    void setKategori(next === "semua" ? null : next);
    void setPage(null);
  };

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <header>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              BPBD Kota Baubau · Repository
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
              Dokumen
              <span className="mt-1 block text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                &amp; SOP
              </span>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Akses dan unduh dokumen publik BPBD Kota Baubau. Semua dokumen
            tersedia tanpa perlu login.
          </p>
        </div>
      </header>

      <div className="mt-12 lg:mt-16">
        <DocumentFilter
          activeCategory={kategori || "semua"}
          categories={categoriesQuery.data?.categories ?? []}
          searchQuery={qInput}
          onCategoryChange={onCategoryChange}
          onSearchChange={setQInput}
        />

        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
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
        </div>

        {isError ? (
          // Let ErrorBoundary handle the design fallback.
          (() => {
            throw new Error("Gagal memuat dokumen.");
          })()
        ) : isLoading ? (
          <DocumentsSkeleton />
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-muted/40 px-6 py-20 text-center">
            <p className="text-lg font-semibold tracking-tight text-secondary">
              Tidak ada dokumen
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada hasil untuk filter/pencarian ini.
            </p>
          </div>
        ) : (
          <ul className="border-t border-border/70">
            {items.map((doc, i) => {
              const idx = (current - 1) * (data?.perPage ?? 6) + i + 1;
              return (
                <li key={doc.id} className="border-b border-border/70">
                  <div className="group py-7 md:grid md:grid-cols-12 md:items-start md:gap-8 md:py-8">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground md:col-span-1 md:pt-1">
                      {String(idx).padStart(2, "0")}
                    </span>

                    <div className="mt-3 space-y-3 md:col-span-9 md:mt-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">
                          {categoryLabels[doc.category] ?? doc.category}
                        </span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                          {doc.date}
                        </span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                          {doc.fileSize}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-secondary group-hover:text-primary transition-colors">
                        {doc.name}
                      </h3>

                      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 md:col-span-2 md:mt-0 md:justify-end">
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={doc.downloadUrl ? "inline-flex" : "pointer-events-none opacity-50"}
                        aria-label={`Unduh ${doc.name}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Unduh
                        </Button>
                      </a>
                      <span className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-muted/70 text-secondary transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      {totalPages > 1 ? (
        <nav className="mt-16 flex flex-wrap items-center justify-end gap-3 sm:gap-4" aria-label="Paginasi dokumen">
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
            <ChevronLeft className="h-4 w-4" />
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
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      ) : null}
      </div>
    </Wrapper>
  );
}

