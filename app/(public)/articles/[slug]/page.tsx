import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  MessageSquareText,
  Archive,
} from "lucide-react";
import db from "@/lib/db";
// Category labels are now taken directly from DB (`article.category`).
import { shareUrlForPath } from "@/lib/site-url";
import Wrapper from "@/components/wrapper";
import { CommentWrapper } from "./comment-wrapper";
import { NewsShareBar } from "./news-share-bar";
import { ArticleContent } from "./article-content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await db.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, status: true, publishedAt: true, createdAt: true },
  });

  if (!news || news.status !== "PUBLISHED") return { title: "Berita Tidak Ditemukan" };

  return {
    title: news.title,
    description: news.excerpt ?? undefined,
    openGraph: {
      title: news.title,
      description: news.excerpt ?? undefined,
      type: "article",
      publishedTime: (news.publishedAt ?? news.createdAt).toISOString(),
    },
  };
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const news = await db.article.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      thumbnailUrl: true,
      category: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      content: true,
    },
  });

  if (!news || news.status !== "PUBLISHED") {
    notFound();
  }

  const relatedNews = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      category: news.category,
      slug: { not: slug },
    },
    select: {
      slug: true,
      title: true,
      thumbnailUrl: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  const shareUrl = shareUrlForPath(`/articles/${slug}`, await headers());

  const quickActions = [
    {
      href: "/aspirations",
      label: "Kirim Aspirasi",
      description: "Sampaikan masukan Anda",
      icon: MessageSquareText,
    },
    {
      href: "/documents",
      label: "Dokumen & SOP",
      description: "Unduh dokumen resmi",
      icon: FileText,
    },
    {
      href: "/archives",
      label: "Arsip Bencana",
      description: "Data historis kejadian",
      icon: Archive,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 md:pt-28 xl:pt-32">
      <Wrapper className="max-w-6xl">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          Kembali ke Berita
        </Link>

        <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">
          <article>
            <header className="space-y-6 border-b-2 border-border pb-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="bg-primary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  {news.category}
                </span>
                <time
                  dateTime={(news.publishedAt ?? news.createdAt).toISOString()}
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {formatDateLabel(news.publishedAt ?? news.createdAt)}
                </time>
              </div>

              <h1 className="text-balance text-3xl font-black leading-[1.12] tracking-tight text-secondary sm:text-4xl lg:text-[2.75rem] uppercase">
                {news.title}
              </h1>

              <p className="text-pretty text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                {news.excerpt}
              </p>

              <NewsShareBar title={news.title} url={shareUrl} />
            </header>

            <div className="relative mt-10 aspect-video overflow-hidden border-2 border-border bg-muted">
              <Image
                src={news.thumbnailUrl ?? "/images/hero-2.avif"}
                alt={news.title}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover transition-all duration-500 hover:scale-105"
                priority
              />
            </div>

            <div className="mt-8 border-2 border-border bg-card p-6 sm:p-8">
              <ArticleContent value={news.content} />
            </div>

            <div className="mt-12 border-t-2 border-border pt-8">
              <CommentWrapper slug={slug} />
            </div>
          </article>

          <aside className="space-y-10 lg:sticky lg:top-32 lg:self-start">
            {relatedNews.length > 0 ? (
              <section aria-labelledby="related-heading">
                <h2
                  id="related-heading"
                  className="border-b-2 border-border pb-3 font-mono text-xs font-bold uppercase tracking-widest text-secondary"
                >
                  Berita Terkait
                </h2>
                <ul className="mt-4 space-y-4">
                  {relatedNews.map((related) => (
                    <li key={related.slug}>
                      <Link
                        href={`/articles/${related.slug}`}
                        className="group flex gap-4 border-2 border-transparent p-2 transition-colors hover:border-primary hover:bg-muted/50"
                      >
                        <div className="relative h-20 w-24 shrink-0 overflow-hidden border-2 border-border bg-muted">
                          <Image
                            src={related.thumbnailUrl ?? "/images/hero-2.avif"}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {formatDateLabel(related.publishedAt ?? related.createdAt)}
                          </p>
                          <p className="text-sm font-black leading-snug text-secondary transition-colors group-hover:text-primary line-clamp-3">
                            {related.title}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/articles"
                  className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
                >
                  Lihat Semua Berita
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </section>
            ) : null}

            <section aria-labelledby="quick-heading">
              <h2
                id="quick-heading"
                className="border-b-2 border-border pb-3 font-mono text-xs font-bold uppercase tracking-widest text-secondary"
              >
                Aksi Cepat
              </h2>
              <ul className="mt-4 space-y-3">
                {quickActions.map((action) => (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className="group flex items-center gap-4 border-2 border-border bg-card p-4 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground transition-colors group-hover:border-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary">
                        <action.icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-secondary group-hover:text-primary-foreground uppercase">
                          {action.label}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] font-bold tracking-widest text-muted-foreground group-hover:text-primary-foreground/80">
                          {action.description}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:text-primary-foreground group-hover:opacity-100" strokeWidth={2.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </Wrapper>
    </div>
  );
}
