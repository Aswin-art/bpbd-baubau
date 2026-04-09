"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Wrapper from "@/components/wrapper";
import {
  useSuspenseQuery,
} from "@tanstack/react-query";
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

function getCategoryLabel(category: string) {
  const c = category.trim().toLowerCase();
  if (c === "kebencanaan") return "Kebencanaan";
  if (c === "kegiatan") return "Kegiatan";
  if (c === "pengumuman") return "Pengumuman";
  return category || "Lainnya";
}

function formatDateLabel(iso: string | null) {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

async function fetchLatestNews(): Promise<{ items: NewsItem[] }> {
  const res = await fetch(`${getBaseUrl()}/api/public/news?limit=10`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

function FeaturedStory({ news }: { news: NewsItem }) {
  return (
    <Link href={`/articles/${news.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted">
        <div className="relative aspect-video w-full">
          {news.thumbnailUrl ? (
            <Image
              src={news.thumbnailUrl}
              alt={news.title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-white/85">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em]">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(255,255,255,0.08)]" />
              {getCategoryLabel(news.category)}
            </span>
            <span className="text-[12px] text-white/70">
              {formatDateLabel(news.publishedAt)}
            </span>
          </div>

          <h3 className="mt-4 text-balance font-heading text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl">
            {news.title}
          </h3>

          <p className="mt-4 max-w-3xl text-pretty text-[14px] leading-relaxed text-white/75 line-clamp-2 sm:text-[15px]">
            {news.excerpt ?? ""}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors group-hover:text-white">
            Baca selengkapnya
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}

function StoryListItem({
  news,
  index,
}: {
  news: NewsItem;
  index: number;
}) {
  return (
    <Link href={`/articles/${news.slug}`} className="group block">
      <article className="grid grid-cols-[auto_1fr] gap-4 border-t border-border/60 py-5">
        <div className="pt-0.5">
          <span className="block w-10 text-right font-mono text-[12px] font-semibold tabular-nums text-muted-foreground/70">
            {String(index).padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
              {getCategoryLabel(news.category)}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {formatDateLabel(news.publishedAt)}
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-4">
            <h3 className="text-balance font-heading text-[18px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
              {news.title}
            </h3>
            <span className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-primary">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          <p className="mt-2 hidden text-[13px] leading-relaxed text-muted-foreground sm:block line-clamp-1">
            {news.excerpt ?? ""}
          </p>
        </div>
      </article>
    </Link>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  return (
    <Link href={`/articles/${news.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border/60 bg-background transition-colors hover:bg-muted/20">
        <div className="relative aspect-16/10 w-full bg-muted">
          {news.thumbnailUrl ? (
            <Image
              src={news.thumbnailUrl}
              alt={news.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
              {getCategoryLabel(news.category)}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {formatDateLabel(news.publishedAt)}
            </span>
          </div>

          <h3 className="mt-3 text-balance font-heading text-[18px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {news.title}
          </h3>

          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
            {news.excerpt ?? ""}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function NewsSection() {
  const { data } = useSuspenseQuery({
    queryKey: ["public-news-latest"],
    queryFn: fetchLatestNews,
  });

  const items = data?.items ?? [];
  const featured = items[0];
  const rest = items.slice(1);
  const gridItems = rest.slice(0, 6);
  const sideItems = rest.slice(6, 10);

  if (!featured) {
    return (
      <Wrapper className="py-16 sm:py-20">
        <div className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
          <p className="text-sm font-semibold text-foreground">
            Belum ada berita dipublikasikan.
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className="py-16 sm:py-20">
      <div className="mb-10 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
            Informasi terkini
          </p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Berita &amp; Kegiatan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Kegiatan, pengumuman, dan rilis terbaru—dirangkum ringkas untuk Anda.
          </p>
        </div>

        <Link
          href="/articles"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-8 lg:gap-10">
        <FeaturedStory news={featured} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridItems.map((n) => (
              <NewsCard key={n.slug} news={n} />
            ))}
          </div>

          <aside className="lg:pl-2">
            <div className="rounded-2xl border border-border/60 bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/60">
                  Ringkasan
                </p>
                <div className="h-px flex-1 bg-border/60" />
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/60">
                  Terbaru
                </p>
              </div>

              <div className="mt-2">
                {sideItems.length > 0 ? (
                  sideItems.map((news, i) => (
                    <StoryListItem key={news.slug} news={news} index={i + 8} />
                  ))
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Belum ada berita tambahan.
                  </p>
                )}
              </div>

              <div className="mt-5 sm:hidden">
                <Link
                  href="/articles"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background py-3 text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  Lihat semua berita
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Wrapper>
  );
}
