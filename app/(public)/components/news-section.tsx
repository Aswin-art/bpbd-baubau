"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Wrapper from "@/components/wrapper";
import {
  newsArticles,
  categoryLabels,
  categoryColors,
  type NewsArticle,
} from "@/data/dummy-data";

function FeaturedArticle({ news }: { news: NewsArticle }) {
  return (
    <Link href={`/berita/${news.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-secondary h-full min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-8">
        {/* Background image */}
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-secondary via-secondary/80 to-secondary/30" />

        <div className="relative z-10 space-y-4">
          <Badge
            className={`text-[10px] font-semibold uppercase tracking-wider border-0 ${categoryColors[news.category]}`}
          >
            {categoryLabels[news.category]}
          </Badge>

          <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight group-hover:text-primary transition-colors duration-300">
            {news.title}
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 max-w-lg">
            {news.excerpt}
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">{news.dateLabel}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Baca
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ArticleRow({
  news,
  index,
}: {
  news: NewsArticle;
  index: number;
}) {
  return (
    <Link href={`/berita/${news.slug}`} className="group block">
      <article className="flex gap-4 sm:gap-5 py-5 border-b border-border/60 last:border-0 items-start">
        {/* Index number */}
        <span className="text-[32px] font-black leading-none text-muted-foreground/20 tabular-nums select-none shrink-0 w-8 text-right group-hover:text-primary/30 transition-colors duration-300">
          {String(index).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[9px] font-semibold uppercase tracking-wider border-0 shrink-0 ${categoryColors[news.category]}`}
            >
              {categoryLabels[news.category]}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {news.dateLabel}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {news.title}
          </h3>

          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-1 hidden sm:block">
            {news.excerpt}
          </p>
        </div>

        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:border-primary/40 group-hover:text-primary transition-all duration-200 mt-1">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </article>
    </Link>
  );
}

export function NewsSection() {
  const featured = newsArticles[0];
  const rest = newsArticles.slice(1, 5);

  return (
    <Wrapper className="py-16 sm:py-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Informasi Terkini
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Berita &amp; Kegiatan
          </h2>
        </div>
        <Link
          href="/berita"
          className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
        >
          Semua berita
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Editorial layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        {/* Featured */}
        <FeaturedArticle news={featured} />

        {/* List */}
        <div>
          {rest.map((news, i) => (
            <ArticleRow key={news.slug} news={news} index={i + 2} />
          ))}

          {/* Mobile CTA */}
          <div className="pt-6 sm:hidden">
            <Link
              href="/berita"
              className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Semua Berita
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
