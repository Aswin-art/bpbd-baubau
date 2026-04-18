"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Wrapper from "@/components/wrapper";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/url";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  category: string;
  publishedAt: string | null;
};

async function fetchLatestNews(): Promise<{ items: NewsItem[] }> {
  const res = await fetch(`${getBaseUrl()}/api/public/news?limit=10`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

/** Variasi rasio gambar biar grid punya irama (bukan deretan kartu identik). */
function gridAspectClass(i: number) {
  const m = i % 4;
  if (m === 0) return "aspect-4/3";
  if (m === 1) return "aspect-3/4";
  if (m === 2) return "aspect-16/10";
  return "aspect-square";
}

function NewsLead({ news, index }: { news: NewsItem; index: number }) {
  const n = String(index).padStart(2, "0");
  return (
    <Link
      href={`/articles/${news.slug}`}
      className="group block border-l-2 border-transparent pl-4 transition-[border-color] duration-200 hover:border-primary sm:pl-6"
    >
      <article className="grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-end">
        <div className="lg:col-span-7">
          <div className="relative aspect-21/10 overflow-hidden bg-muted">
            {news.thumbnailUrl ? (
              <Image
                src={news.thumbnailUrl}
                alt={news.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
          </div>
        </div>
        <div className="lg:col-span-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
            {n} — utama
          </p>
          <h3 className="mt-4 text-balance font-heading text-3xl font-semibold leading-[1.05] tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl lg:text-[2.75rem]">
            {news.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

function NewsGridItem({
  news,
  index,
  gridIndex,
}: {
  news: NewsItem;
  index: number;
  gridIndex: number;
}) {
  const n = String(index).padStart(2, "0");
  return (
    <div className="break-inside-avoid">
      <Link
        href={`/articles/${news.slug}`}
        className="group block border-l-2 border-transparent pl-3 transition-[border-color] duration-200 hover:border-primary sm:pl-4"
      >
        <article>
          <p className="font-mono text-[10px] font-semibold tabular-nums uppercase tracking-[0.38em] text-muted-foreground">
            {n}
          </p>
          <div
            className={`relative mt-3 overflow-hidden bg-muted ${gridAspectClass(gridIndex)}`}
          >
            {news.thumbnailUrl ? (
              <Image
                src={news.thumbnailUrl}
                alt={news.title}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 42vw, 28vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
          </div>
          <h3 className="mt-3 text-balance font-heading text-[17px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {news.title}
          </h3>
        </article>
      </Link>
    </div>
  );
}

export function NewsSection() {
  const { data } = useSuspenseQuery({
    queryKey: ["public-news-latest"],
    queryFn: fetchLatestNews,
  });

  const items = data?.items ?? [];
  const gridItems = items.slice(0, 10);
  const lead = gridItems[0];
  const rest = gridItems.slice(1);

  if (gridItems.length === 0) {
    return (
      <Wrapper className="py-16 sm:py-20">
        <p className="max-w-md border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">
          Belum ada berita dipublikasikan.
        </p>
      </Wrapper>
    );
  }

  return (
    <section className="relative border-t border-border">
      <Wrapper className="relative py-16 sm:py-24">
        {/* Masthead: kaku di kiri, aksi di kanan — tanpa subcopy panjang */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-baseline gap-4">
              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.42em] text-muted-foreground"
                aria-hidden
              >
                01
              </span>
              <span className="h-px flex-1 max-w-16 bg-foreground/20" aria-hidden />
            </div>
            <h2 className="mt-4 text-balance font-heading text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-foreground">
              Berita &amp; kegiatan
            </h2>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/40"
            >
              Semua Berita
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>

        {lead ? (
          <div className="mt-14 border-t border-border pt-14">
            <NewsLead news={lead} index={1} />
          </div>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-16 border-t border-border pt-12">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
              Lainnya
            </p>
            <div className="mt-8 columns-1 gap-x-8 gap-y-10 sm:columns-2 lg:columns-3">
              {rest.map((n, i) => (
                <div key={n.slug} className="mb-10 break-inside-avoid">
                  <NewsGridItem news={n} index={i + 2} gridIndex={i} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Wrapper>
    </section>
  );
}
