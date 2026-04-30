"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import {
  FileText,
  FolderSearch,
  MapPin,
  Newspaper,
  ArrowUpRight,
  Search,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import Wrapper from "@/components/wrapper";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryLabels } from "@/lib/public-labels";

type PublicArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedAt: string | null;
  dateLabel: string;
};

type NewsApiResponse = {
  items: PublicArticleListItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  tag?: string;
  q?: string;
};

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

function GlobalSearchSkeleton() {
  return (
    <Wrapper className="pt-24 pb-20 md:pt-28 xl:pt-32">
      <div className="animate-pulse space-y-10">
        <div className="space-y-4 border-b-2 border-border pb-8">
          <div className="h-4 w-56 bg-muted" />
          <div className="h-12 w-full max-w-2xl bg-muted sm:h-14" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 border-2 border-border bg-muted" />
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

function GlobalSearchErrorFallback({ error }: FallbackProps) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Terjadi kesalahan saat memuat pencarian.";
  return (
    <Wrapper className="pt-24 pb-20 md:pt-28 xl:pt-32">
      <div className="border-2 border-destructive bg-destructive/5 p-6 text-sm font-bold uppercase tracking-widest text-destructive">
        {message}
      </div>
    </Wrapper>
  );
}

async function fetchArticles(q: string, tahun: string): Promise<NewsApiResponse> {
  const qs = new URLSearchParams();
  qs.set("hal", "1");
  if (q) qs.set("q", q);
  if (tahun && tahun !== "semua") qs.set("tahun", tahun);
  const res = await fetch(`/api/public/articles?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat berita.");
  return res.json();
}

async function fetchDocuments(q: string, tahun: string): Promise<DocumentsApiResponse> {
  const qs = new URLSearchParams();
  qs.set("hal", "1");
  if (q) qs.set("q", q);
  if (tahun && tahun !== "semua") qs.set("tahun", tahun);
  const res = await fetch(`/api/public/documents?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat dokumen.");
  return res.json();
}

async function fetchArchives(params: { q: string; tahun: string }): Promise<ArchivesApiResponse> {
  const qs = new URLSearchParams();
  qs.set("hal", "1");
  if (params.q) qs.set("q", params.q);
  if (params.tahun && params.tahun !== "semua") qs.set("tahun", params.tahun);
  const res = await fetch(`/api/public/archives?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat arsip bencana.");
  return res.json();
}

type SearchYearsResponse = { years: string[] };
async function fetchSearchYears(): Promise<SearchYearsResponse> {
  const res = await fetch("/api/public/search/years", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat daftar tahun.");
  return res.json();
}

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

async function downloadPublicDocument(params: { id: string; name: string }) {
  const res = await fetch(`/api/public/documents/${params.id}/download`);
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
    params.name ||
    "dokumen";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadPublicArchive(params: { id: string; name: string }) {
  const res = await fetch(`/api/public/archives/${params.id}/download`);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || "Gagal mengunduh arsip.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filenameFromDisposition(res.headers.get("content-disposition")) ||
    params.name ||
    "arsip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function GlobalSearchClient() {
  return (
    <ErrorBoundary FallbackComponent={GlobalSearchErrorFallback}>
      <Suspense fallback={<GlobalSearchSkeleton />}>
        <GlobalSearchClientInner />
      </Suspense>
    </ErrorBoundary>
  );
}

function GlobalSearchClientInner() {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [tipe, setTipe] = useQueryState(
    "tipe",
    parseAsString.withDefault("semua"),
  );
  const [tahun, setTahun] = useQueryState("tahun", parseAsString.withDefault("semua"));
  const [qInput, setQInput] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = qInput.trim();
      void setQ(next ? next : null);
    }, 350);
    return () => clearTimeout(t);
  }, [qInput, setQ]);

  useEffect(() => {
    setQInput(q);
  }, [q]);

  const normalizedType = (tipe || "semua").trim().toLowerCase();
  const showArticles = normalizedType === "semua" || normalizedType === "berita";
  const showDocuments = normalizedType === "semua" || normalizedType === "dokumen";
  const showArchives = normalizedType === "semua" || normalizedType === "arsip";

  const yearsQuery = useQuery({
    queryKey: ["global-search", "search-years"],
    queryFn: fetchSearchYears,
    staleTime: 1000 * 60 * 60,
  });

  const articlesQuery = useQuery({
    queryKey: ["global-search", "articles", q, tahun],
    queryFn: () => fetchArticles(q, tahun || "semua"),
    enabled: showArticles,
  });

  const documentsQuery = useQuery({
    queryKey: ["global-search", "documents", q, tahun],
    queryFn: () => fetchDocuments(q, tahun || "semua"),
    enabled: showDocuments,
  });

  const archivesQuery = useQuery({
    queryKey: ["global-search", "archives", q, tahun],
    queryFn: () => fetchArchives({ q, tahun }),
    enabled: showArchives,
  });

  const anyLoading =
    (showArticles && articlesQuery.isLoading) ||
    (showDocuments && documentsQuery.isLoading) ||
    (showArchives && archivesQuery.isLoading);
  const anyFetching =
    (showArticles && articlesQuery.isFetching) ||
    (showDocuments && documentsQuery.isFetching) ||
    (showArchives && archivesQuery.isFetching);

  const topArticles = useMemo(
    () => (articlesQuery.data?.items ?? []).slice(0, 3),
    [articlesQuery.data],
  );
  const topDocuments = useMemo(
    () => (documentsQuery.data?.items ?? []).slice(0, 3),
    [documentsQuery.data],
  );
  const topArchives = useMemo(
    () => (archivesQuery.data?.items ?? []).slice(0, 3),
    [archivesQuery.data],
  );

  const totalArticles = showArticles ? (articlesQuery.data?.total ?? 0) : 0;
  const totalDocuments = showDocuments ? (documentsQuery.data?.total ?? 0) : 0;
  const totalArchives = showArchives ? (archivesQuery.data?.total ?? 0) : 0;

  const hasQuery = q.trim().length > 0;
  const hasActiveYear = Boolean(tahun && tahun !== "semua");
  const emptyAll =
    (hasQuery || hasActiveYear) &&
    totalArticles === 0 &&
    totalDocuments === 0 &&
    totalArchives === 0;

  const resultListSubtitle = `${hasQuery ? "Hasil pencarian" : "Terbaru"}${
    tahun && tahun !== "semua" ? ` · ${tahun}` : ""
  }`;

  /** Tahun dari API + tahun terpilih di URL (agar item tetap valid jika belum ada di cache). */
  const yearOptions = useMemo(() => {
    const fromApi = yearsQuery.data?.years ?? [];
    const merged = new Set(fromApi);
    if (tahun && tahun !== "semua" && /^\d{4}$/.test(tahun)) merged.add(tahun);
    return Array.from(merged).sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true }),
    );
  }, [yearsQuery.data?.years, tahun]);

  return (
    <Wrapper className="pt-24 pb-20 md:pt-28 xl:pt-32">
      <header className="border-b-2 border-border pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
              BPBD Kota Baubau · Pencarian Global
            </p>
            <h1 className="mt-4 text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl md:text-[3.5rem] uppercase">
              Cari Arsip, Berita, Dokumen
            </h1>
          </div>
          <p className="max-w-md text-base font-medium leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Ketik kata kunci untuk mencari di semua modul publik sekaligus.
          </p>
        </div>
      </header>

      <section className="mt-12 lg:mt-16">
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 border-2 border-border bg-card px-4 py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Cari judul berita, nama dokumen, atau nama arsip…"
              className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Cari"
            />
            {anyFetching && (
              <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">
                Memuat…
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tipe
            </span>
            <Select
              value={normalizedType || "semua"}
              onValueChange={(v) => void setTipe(v === "semua" ? null : v)}
            >
              <SelectTrigger className="h-10 w-[180px] rounded-none border-2 border-border bg-card font-mono text-xs font-bold uppercase tracking-widest text-secondary focus:ring-0 focus:border-primary">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="semua" className="font-mono text-xs font-bold uppercase tracking-widest">Semua</SelectItem>
                <SelectItem value="berita" className="font-mono text-xs font-bold uppercase tracking-widest">Berita</SelectItem>
                <SelectItem value="dokumen" className="font-mono text-xs font-bold uppercase tracking-widest">Dokumen & SOP</SelectItem>
                <SelectItem value="arsip" className="font-mono text-xs font-bold uppercase tracking-widest">Arsip Bencana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tahun
            </span>
            <Select
              value={tahun || "semua"}
              onValueChange={(v) => void setTahun(v === "semua" ? null : v)}
            >
              <SelectTrigger className="h-10 w-[160px] rounded-none border-2 border-border bg-card font-mono text-xs font-bold uppercase tracking-widest text-secondary focus:ring-0 focus:border-primary">
                <SelectValue
                  placeholder={
                    yearsQuery.isLoading ? "Memuat tahun…" : "Semua tahun"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="semua" className="font-mono text-xs font-bold uppercase tracking-widest">Semua tahun</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y} className="font-mono text-xs font-bold uppercase tracking-widest">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {yearsQuery.isSuccess && yearOptions.length === 0 && (
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Belum ada tahun di data publik (tambah berita, dokumen, atau arsip
            terlebih dahulu).
          </p>
        )}
        {yearsQuery.isError && (
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-destructive">
            Tidak bisa memuat daftar tahun. Coba muat ulang halaman.
          </p>
        )}

        <p className="mt-6 border-b-2 border-border pb-4 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {hasQuery ? (
            <>
              Menampilkan hasil untuk{" "}
              <span className="text-secondary">“{q}”</span>
              {hasActiveYear ? (
                <>
                  {" "}
                  (tahun <span className="text-secondary">{tahun}</span>)
                </>
              ) : null}
            </>
          ) : hasActiveYear ? (
            <>
              Menyaring berdasarkan tahun{" "}
              <span className="text-secondary">{tahun}</span>
              {" "}
              pada modul yang ditampilkan.
            </>
          ) : (
            "Menampilkan data terbaru dari setiap modul. Gunakan pencarian atau filter tahun untuk memfilter."
          )}
        </p>

        {emptyAll && !anyLoading && (
          <div className="mt-8 border-2 border-border bg-muted p-8">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-secondary bg-secondary text-secondary-foreground">
                <FolderSearch className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-black uppercase text-secondary">
                  {hasQuery ? (
                    <>
                      Tidak ada hasil untuk “{q}”
                      {hasActiveYear ? ` · ${tahun}` : ""}
                    </>
                  ) : (
                    <>Tidak ada data untuk tahun {tahun}.</>
                  )}
                </p>
                <p className="mt-2 text-base font-medium text-muted-foreground">
                  {hasQuery
                    ? "Coba kata kunci lain, tahun lain, atau istilah yang lebih umum."
                    : "Coba tahun lain atau ubah tipe konten (Berita / Dokumen / Arsip)."}
                </p>
              </div>
            </div>
          </div>
        )}

        {!emptyAll && (
          <div className="mt-10 space-y-10">
            {showArticles && (
              <ResultCard
                title="Berita"
                icon={<Newspaper className="h-5 w-5" strokeWidth={2.5} />}
                count={totalArticles}
                viewAllHref={
                  hasQuery ? `/articles?q=${encodeURIComponent(q)}` : "/articles"
                }
                subtitle={resultListSubtitle}
              >
                {topArticles.length === 0 ? (
                  <EmptyMini />
                ) : (
                  <ul className="space-y-4">
                    {topArticles.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/articles/${a.slug}`}
                          className="group block border-2 border-border bg-card p-5 transition-colors hover:border-primary"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-lg font-black leading-snug text-secondary group-hover:text-primary transition-colors">
                                {a.title}
                              </p>
                              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground line-clamp-2">
                                {a.excerpt}
                              </p>
                            </div>
                            <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:text-primary group-hover:opacity-100" strokeWidth={2.5} />
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                              {categoryLabels[a.category] ?? a.category}
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {a.dateLabel}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </ResultCard>
            )}

            {showDocuments && (
              <ResultCard
                title="Dokumen & SOP"
                icon={<FileText className="h-5 w-5" strokeWidth={2.5} />}
                count={totalDocuments}
                viewAllHref={
                  hasQuery ? `/documents?q=${encodeURIComponent(q)}` : "/documents"
                }
                subtitle={hasQuery ? "Hasil pencarian" : "Terbaru"}
              >
                {topDocuments.length === 0 ? (
                  <EmptyMini />
                ) : (
                  <ul className="space-y-4">
                    {topDocuments.map((d) => (
                      <li key={d.id}>
                        <div className="group border-2 border-border bg-card p-5 transition-colors hover:border-primary">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-lg font-black leading-snug text-secondary group-hover:text-primary transition-colors">
                                {d.name}
                              </p>
                              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground line-clamp-2">
                                {d.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await downloadPublicDocument({ id: d.id, name: d.name });
                                  } catch (e) {
                                    toast.error((e as Error).message);
                                  }
                                }}
                                className="flex h-10 w-10 items-center justify-center border-2 border-border bg-card text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                aria-label={`Unduh ${d.name}`}
                              >
                                <Download className="h-4 w-4" strokeWidth={2.5} />
                              </button>
                              <a
                                href={d.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center border-2 border-border bg-card text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                aria-label={`Buka ${d.name} di tab baru`}
                              >
                                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                              </a>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                              {d.category}
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {d.date}
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {d.fileSize}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ResultCard>
            )}

            {showArchives && (
              <ResultCard
                title="Arsip Bencana"
                icon={<MapPin className="h-5 w-5" strokeWidth={2.5} />}
                count={totalArchives}
                viewAllHref={
                  hasQuery ? `/archives?q=${encodeURIComponent(q)}` : "/archives"
                }
                subtitle={resultListSubtitle}
              >
                {topArchives.length === 0 ? (
                  <EmptyMini />
                ) : (
                  <ul className="space-y-4">
                    {topArchives.map((d) => (
                      <li key={d.id}>
                        <div className="group border-2 border-border bg-card p-5 transition-colors hover:border-primary">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-lg font-black leading-snug text-secondary group-hover:text-primary transition-colors">
                                {d.name}
                              </p>
                              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground line-clamp-2">
                                {d.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await downloadPublicArchive({ id: d.id, name: d.name });
                                  } catch (e) {
                                    toast.error((e as Error).message);
                                  }
                                }}
                                className="flex h-10 w-10 items-center justify-center border-2 border-border bg-card text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                aria-label={`Unduh ${d.name}`}
                              >
                                <Download className="h-4 w-4" strokeWidth={2.5} />
                              </button>
                              <a
                                href={d.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center border-2 border-border bg-card text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                aria-label={`Buka ${d.name} di tab baru`}
                              >
                                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                              </a>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                              {d.year}
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {d.dateLabel}
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {d.fileSize}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ResultCard>
            )}
          </div>
        )}

        {(articlesQuery.isError || documentsQuery.isError || archivesQuery.isError) &&
          (
            <div className="mt-8 border-2 border-destructive bg-destructive/5 p-6 font-mono text-xs font-bold uppercase tracking-widest text-destructive">
              Terjadi kesalahan saat memuat hasil pencarian. Silakan coba lagi.
            </div>
          )}
      </section>
    </Wrapper>
  );
}

function EmptyMini() {
  return (
    <div className="border-2 border-border bg-muted p-6 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
      Tidak ada hasil.
    </div>
  );
}

function ResultCard({
  title,
  icon,
  count,
  viewAllHref,
  subtitle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  viewAllHref: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-border bg-card">
      <div className="border-b-2 border-border bg-muted px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-3 text-xl font-black uppercase text-secondary">
              {icon}
              {title}
            </h2>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {subtitle ? `${subtitle} · ` : ""}
              {count} Hasil
            </p>
          </div>
          <Button 
            asChild 
            variant="outline" 
            className="shrink-0 rounded-none border-2 border-border bg-card font-mono text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href={viewAllHref}>
              Lihat Semua
              <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
            </Link>
          </Button>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
