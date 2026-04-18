"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
import { Download, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
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

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const m = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(header);
  if (!m?.[1]) return null;
  const raw = m[1].replace(/"/g, "").trim();
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function downloadDocument(doc: PublicDocumentItem) {
  const res = await fetch(`/api/public/documents/${doc.id}/download`);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || "Gagal mengunduh dokumen.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filenameFromDisposition(res.headers.get("content-disposition")) ||
    doc.name ||
    "dokumen";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
      <header className="border-b-2 border-border pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
              BPBD Kota Baubau · Repository
            </p>
            <h1 className="mt-4 text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl md:text-[3.5rem] uppercase">
              Dokumen
              <span className="mt-2 block text-2xl font-black tracking-tight text-muted-foreground sm:text-3xl">
                &amp; SOP
              </span>
            </h1>
          </div>
          <p className="max-w-md text-base font-medium leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
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

        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-border pb-4">
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
          // Let ErrorBoundary handle the design fallback.
          (() => {
            throw new Error("Gagal memuat dokumen.");
          })()
        ) : isLoading ? (
          <DocumentsSkeleton />
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
          <ul className="flex flex-col gap-6">
            {items.map((doc, i) => {
              const idx = (current - 1) * (data?.perPage ?? 6) + i + 1;
              return (
                <li key={doc.id} className="group border-2 border-border bg-card p-6 transition-colors hover:border-primary">
                  <div className="md:grid md:grid-cols-12 md:items-start md:gap-8">
                    <div className="hidden md:col-span-1 md:flex md:pt-1">
                      <span className="font-mono text-xl font-black text-muted-foreground/50 group-hover:text-primary transition-colors">
                        {String(idx).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-3 space-y-4 md:col-span-9 md:mt-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                          {categoryLabels[doc.category] ?? doc.category}
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {doc.date}
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
                        variant="default"
                        className="w-full rounded-none border-2 border-primary bg-primary font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-background hover:text-primary disabled:opacity-50 md:w-auto"
                        disabled={!doc.downloadUrl}
                        onClick={async () => {
                          try {
                            await downloadDocument(doc);
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }}
                        aria-label={`Unduh ${doc.name}`}
                      >
                        <Download className="mr-2 h-4 w-4" strokeWidth={2.5} />
                        Unduh
                      </Button>
                      {doc.downloadUrl ? (
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka ${doc.name} di tab baru`}
                          className="flex w-full items-center justify-center border-2 border-border bg-card py-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground md:w-auto md:px-4"
                        >
                          Buka <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      {totalPages > 1 ? (
        <nav className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-border pt-8" aria-label="Paginasi dokumen">
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
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
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
            Berikutnya
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </nav>
      ) : null}
      </div>
    </Wrapper>
  );
}
