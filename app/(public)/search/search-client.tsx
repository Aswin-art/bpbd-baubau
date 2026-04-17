"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryLabels } from "@/data/dummy-data";
import { cn } from "@/lib/utils";

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
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <div className="animate-pulse space-y-10">
        <div className="space-y-4">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="h-11 w-full max-w-2xl rounded bg-muted" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

function GlobalSearchErrorFallback({ error }: { error: Error }) {
  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {error.message || "Terjadi kesalahan saat memuat pencarian."}
      </div>
    </Wrapper>
  );
}

async function fetchArticles(q: string): Promise<NewsApiResponse> {
  const qs = new URLSearchParams();
  qs.set("hal", "1");
  if (q) qs.set("q", q);
  const res = await fetch(`/api/public/articles?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat berita.");
  return res.json();
}

async function fetchDocuments(q: string): Promise<DocumentsApiResponse> {
  const qs = new URLSearchParams();
  qs.set("hal", "1");
  if (q) qs.set("q", q);
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

type ArchiveYearsResponse = { years: string[] };
async function fetchArchiveYears(): Promise<ArchiveYearsResponse> {
  const res = await fetch("/api/public/archives/years", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat tahun arsip.");
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
    queryKey: ["global-search", "archives-years"],
    queryFn: fetchArchiveYears,
    staleTime: 1000 * 60 * 60,
  });

  // If user switches away from "arsip", clear year filter.
  useEffect(() => {
    if (normalizedType !== "arsip" && tahun && tahun !== "semua") {
      void setTahun(null);
    }
  }, [normalizedType, setTahun, tahun]);

  const articlesQuery = useQuery({
    queryKey: ["global-search", "articles", q],
    queryFn: () => fetchArticles(q),
    enabled: showArticles,
  });

  const documentsQuery = useQuery({
    queryKey: ["global-search", "documents", q],
    queryFn: () => fetchDocuments(q),
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
  const emptyAll =
    hasQuery && totalArticles === 0 && totalDocuments === 0 && totalArchives === 0;

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <header>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              BPBD Kota Baubau · Pencarian global
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
              Cari
              <span className="mt-1 block text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                arsip, berita, dokumen
              </span>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Ketik kata kunci untuk mencari di semua modul publik sekaligus.
          </p>
        </div>
      </header>

      <section className="mt-12 lg:mt-16">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Cari judul berita, nama dokumen, atau nama arsip…"
            className="h-11 pl-10"
          />
          {anyFetching && (
            <span className="absolute right-3 top-3.5 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              memuat…
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Tipe
            </span>
            <Select
              value={normalizedType || "semua"}
              onValueChange={(v) => void setTipe(v === "semua" ? null : v)}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="berita">Berita</SelectItem>
                <SelectItem value="dokumen">Dokumen & SOP</SelectItem>
                <SelectItem value="arsip">Arsip Bencana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Tahun
            </span>
            <Select
              value={tahun || "semua"}
              onValueChange={(v) => void setTahun(v === "semua" ? null : v)}
              disabled={normalizedType !== "arsip"}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Semua tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua tahun</SelectItem>
                {(yearsQuery.data?.years ?? []).map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          {hasQuery ? (
            <>
              Menampilkan hasil untuk{" "}
              <span className="font-semibold text-foreground">“{q}”</span>
            </>
          ) : (
            "Menampilkan data terbaru dari setiap modul. Gunakan pencarian untuk memfilter."
          )}
        </p>

        {emptyAll && !anyLoading && (
          <div className="mt-8 rounded-2xl border bg-muted/30 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderSearch className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary">
                  Tidak ada hasil untuk “{q}”
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba kata kunci lain atau gunakan istilah yang lebih umum.
                </p>
              </div>
            </div>
          </div>
        )}

        {!emptyAll && (
          <div className="mt-10 space-y-6">
            {showArticles && (
              <ResultCard
                title="Berita"
                icon={<Newspaper className="h-4 w-4" />}
                count={totalArticles}
                viewAllHref={
                  hasQuery ? `/articles?q=${encodeURIComponent(q)}` : "/articles"
                }
                subtitle={hasQuery ? "Hasil pencarian" : "Terbaru"}
              >
                {topArticles.length === 0 ? (
                  <EmptyMini />
                ) : (
                  <ul className="space-y-3">
                    {topArticles.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/articles/${a.slug}`}
                          className="group block rounded-xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-secondary line-clamp-2 group-hover:text-primary">
                                {a.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {a.excerpt}
                              </p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {categoryLabels[a.category] ?? a.category}
                            </Badge>
                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
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
                icon={<FileText className="h-4 w-4" />}
                count={totalDocuments}
                viewAllHref={
                  hasQuery ? `/documents?q=${encodeURIComponent(q)}` : "/documents"
                }
                subtitle={hasQuery ? "Hasil pencarian" : "Terbaru"}
              >
                {topDocuments.length === 0 ? (
                  <EmptyMini />
                ) : (
                  <ul className="space-y-3">
                    {topDocuments.map((d) => (
                      <li key={d.id}>
                        <div className="rounded-xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-secondary line-clamp-2">
                                {d.name}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
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
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted"
                                aria-label={`Unduh ${d.name}`}
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <a
                                href={d.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted"
                                aria-label={`Buka ${d.name} di tab baru`}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {d.category}
                            </Badge>
                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                              {d.date} · {d.fileSize}
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
                icon={<MapPin className="h-4 w-4" />}
                count={totalArchives}
                viewAllHref={
                  hasQuery ? `/archives?q=${encodeURIComponent(q)}` : "/archives"
                }
                subtitle={
                  hasQuery
                    ? `Hasil pencarian${tahun && tahun !== "semua" ? ` · ${tahun}` : ""}`
                    : `Terbaru${tahun && tahun !== "semua" ? ` · ${tahun}` : ""}`
                }
              >
                {topArchives.length === 0 ? (
                  <EmptyMini />
                ) : (
                  <ul className="space-y-3">
                    {topArchives.map((d) => (
                      <li key={d.id}>
                        <div className="rounded-xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-secondary line-clamp-2">
                                {d.name}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
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
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted"
                                aria-label={`Unduh ${d.name}`}
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <a
                                href={d.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted"
                                aria-label={`Buka ${d.name} di tab baru`}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              {d.year}
                            </Badge>
                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                              {d.dateLabel} · {d.fileSize}
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
            <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
              Terjadi kesalahan saat memuat hasil pencarian. Silakan coba lagi.
            </div>
          )}
      </section>
    </Wrapper>
  );
}

function EmptyMini() {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
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
    <Card className="py-5">
      <CardHeader className="px-5 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-sm flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <p className="mt-2 text-xs text-muted-foreground">
              {subtitle ? `${subtitle} · ` : ""}
              {count} hasil
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={viewAllHref}>
              Lihat semua
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("px-5 pt-4")}>{children}</CardContent>
    </Card>
  );
}

