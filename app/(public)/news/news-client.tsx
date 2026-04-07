"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import type { NewsArticle } from "@/data/dummy-data";
import { categoryLabels } from "@/data/dummy-data";
import { NewsErrorFallback, NewsSkeleton } from "./news-fallback";
import Wrapper from "@/components/wrapper";

type NewsApiResponse = {
  items: NewsArticle[];
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
  const res = await fetch(`/api/news?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat berita.");
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

  const totalPages = data?.totalPages ?? 1;
  const current = data?.page ?? page;
  const items = data?.items ?? [];

  const tagOptions = useMemo(() => {
    const entries = Object.entries(categoryLabels);
    return [
      { value: "semua", label: "Semua" },
      ...entries.map(([value, label]) => ({ value, label })),
    ];
  }, []);

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
      <header>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              BPBD Kota Baubau · Publikasi
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
              Berita
              <span className="mt-1 block text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                &amp; kegiatan
              </span>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
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
                      ? "rounded-full bg-secondary px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-foreground"
                      : "rounded-full border border-border/60 bg-background px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-secondary"
                  }
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3.5 py-2">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Cari berita…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Cari berita"
            />
            {qInput.trim() ? (
              <button
                type="button"
                onClick={clearSearch}
                className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
              >
                hapus
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} artikel` : "Memuat…"}
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
            throw new Error("Gagal memuat berita.");
          })()
        ) : isLoading ? (
          <NewsSkeleton />
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-muted/40 px-6 py-20 text-center">
            <p className="text-lg font-semibold tracking-tight text-secondary">
              Belum ada artikel
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
                Tidak ada hasil untuk filter/pencarian ini.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-12 lg:gap-16">
            {items.map((news, i) => {
              const idx = (current - 1) * (data?.perPage ?? 4) + i + 1;
              return (
                <li key={news.slug}>
                  <Link
                    href={`/news/${news.slug}`}
                    className="group block rounded-2xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  >
                    <article className="flex flex-col gap-6 md:grid md:grid-cols-12 md:items-start md:gap-8 lg:gap-10">
                      <span className="text-xs tabular-nums text-muted-foreground md:col-span-1 md:pt-1">
                        {String(idx).padStart(2, "0")}
                      </span>

                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted md:col-span-3 md:aspect-4/3">
                        <Image
                          src={news.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>

                      <div className="min-w-0 space-y-3 md:col-span-6 lg:col-span-7">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-medium text-primary">
                            {categoryLabels[news.category] ?? news.category}
                          </span>
                          <span>{news.dateLabel}</span>
                        </div>
                        <h2 className="text-xl font-bold leading-snug tracking-[-0.02em] text-secondary transition-colors group-hover:text-primary md:text-2xl">
                          {news.title}
                        </h2>
                        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                          {news.excerpt}
                        </p>
                      </div>

                      <div className="hidden justify-end md:col-span-2 md:flex lg:col-span-1">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-secondary transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                        </span>
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
            className="mt-16 flex flex-wrap items-center justify-end gap-3 sm:gap-4"
            aria-label="Paginasi berita"
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
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        ) : null}
      </div>
    </Wrapper>
  );
}

