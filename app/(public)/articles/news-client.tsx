"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { NewsErrorFallback, NewsSkeleton } from "./news-fallback";
import Wrapper from "@/components/wrapper";

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

async function fetchNews(params: {
  page: number;
  tag: string;
  q: string;
}): Promise<NewsApiResponse> {
  const qs = new URLSearchParams();
  if (params.page > 1) qs.set("hal", String(params.page));
  if (params.tag && params.tag !== "semua") qs.set("tag", params.tag);
  if (params.q) qs.set("q", params.q);
  const res = await fetch(`/api/public/articles?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat berita.");
  return res.json();
}

async function fetchArticleCategories(): Promise<{ categories: string[] }> {
  const res = await fetch("/api/public/articles/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat kategori berita.");
  return res.json();
}

export function NewsClient() {
  return (
    <ErrorBoundary FallbackComponent={NewsErrorFallback}>
      <Suspense fallback={<NewsSkeleton />}>
        <NewsClientInner />
      </Suspense>
    </ErrorBoundary>
  );
}

function NewsClientInner() {
  const [page, setPage] = useQueryState(
    "hal",
    parseAsInteger.withDefault(1),
  );
  const [tag, setTag] = useQueryState("tag", parseAsString.withDefault("semua"));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));

  const [qInput, setQInput] = useState(q);

  // Debounce typing → URL param.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = qInput.trim();
      void setQ(next ? next : null);
    }, 350);
    return () => clearTimeout(t);
  }, [qInput, setQ]);

  // Keep input in sync with external URL changes.
  useEffect(() => {
    setQInput(q);
  }, [q]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["public-news", page, tag, q],
    queryFn: () => fetchNews({ page, tag, q }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["public-news-categories"],
    queryFn: fetchArticleCategories,
    staleTime: 1000 * 60 * 60,
  });

  const totalPages = data?.totalPages ?? 1;
  const current = data?.page ?? page;
  const items = data?.items ?? [];

  const tagOptions = useMemo(() => {
    const cats = categoriesQuery.data?.categories ?? [];
    return [
      { value: "semua", label: "Semua" },
      ...cats.map((value) => ({ value, label: value })),
    ];
  }, [categoriesQuery.data?.categories]);

  const goTo = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    // Clean URL when page 1.
    void setPage(next === 1 ? null : next);
  };

  const setTagAndReset = (next: string) => {
    void setTag(next === "semua" ? null : next);
    void setPage(null);
  };

  const clearSearch = () => {
    setQInput("");
    void setQ(null);
    void setPage(null);
  };

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <header className="border-b-2 border-border pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
              BPBD Kota Baubau · Publikasi
            </p>
            <h1 className="mt-4 text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl md:text-[3.5rem] uppercase">
              Berita
              <span className="mt-2 block text-2xl font-black tracking-tight text-muted-foreground sm:text-3xl">
                &amp; Kegiatan
              </span>
            </h1>
          </div>
          <p className="max-w-md text-base font-medium leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Arsip informasi resmi: kegiatan lapangan, edukasi masyarakat, dan
            siaran pers penanggulangan bencana.
          </p>
        </div>
      </header>

      <div className="mt-12 lg:mt-16">
        <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="flex flex-wrap items-center gap-2.5">
            {tagOptions.map((opt) => {
              const active = (tag || "semua") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTagAndReset(opt.value)}
                  className={
                    active
                      ? "border-2 border-secondary bg-secondary px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors"
                      : "border-2 border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  }
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-2 border-border bg-card px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Cari berita…"
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Cari berita"
            />
            {qInput.trim() ? (
              <button
                type="button"
                onClick={clearSearch}
                className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                Hapus
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-border pb-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {data ? `${data.total} Artikel` : "Memuat…"}
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
            throw new Error("Gagal memuat berita.");
          })()
        ) : isLoading ? (
          <NewsSkeleton />
        ) : items.length === 0 ? (
          <div className="border-2 border-border bg-muted px-6 py-20 text-center">
            <p className="text-xl font-black tracking-tight text-secondary uppercase">
              Belum Ada Artikel
            </p>
            <p className="mt-2 text-base font-medium text-muted-foreground">
              Tidak ada hasil untuk filter/pencarian ini.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-8">
            {items.map((news, i) => {
              const idx = (current - 1) * (data?.perPage ?? 4) + i + 1;
              return (
                <li key={news.slug}>
                  <Link
                    href={`/articles/${news.slug}`}
                    className="group block border-2 border-border bg-card p-6 transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none"
                  >
                    <article className="flex flex-col gap-6 md:grid md:grid-cols-12 md:items-start md:gap-8 lg:gap-10">
                      <div className="hidden md:col-span-1 md:flex md:pt-1">
                        <span className="font-mono text-xl font-black text-muted-foreground/50 group-hover:text-primary transition-colors">
                          {String(idx).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="relative aspect-video w-full overflow-hidden border-2 border-border bg-muted md:col-span-4 md:aspect-4/3">
                        <Image
                          src={news.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0 space-y-4 md:col-span-7">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                            {news.category}
                          </span>
                          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {news.dateLabel}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black leading-snug tracking-tight text-secondary transition-colors group-hover:text-primary md:text-3xl">
                          {news.title}
                        </h2>
                        <p className="max-w-2xl text-pretty text-base font-medium leading-relaxed text-muted-foreground">
                          {news.excerpt}
                        </p>
                        
                        <div className="pt-4">
                          <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                            Baca Selengkapnya
                            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav
            className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-border pt-8"
            aria-label="Paginasi berita"
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
              Selanjutnya
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </nav>
        ) : null}
      </div>
    </Wrapper>
  );
}
