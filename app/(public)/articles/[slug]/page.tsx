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
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Kembali ke Berita
        </Link>

        <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">
          <article>
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-primary">
                  {news.category}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <time
                  dateTime={(news.publishedAt ?? news.createdAt).toISOString()}
                >
                  {formatDateLabel(news.publishedAt ?? news.createdAt)}
                </time>
              </div>

              <h1 className="text-balance text-3xl font-bold leading-[1.12] tracking-[-0.03em] text-secondary sm:text-4xl lg:text-[2.75rem]">
                {news.title}
              </h1>

              <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {news.excerpt}
              </p>

              <NewsShareBar title={news.title} url={shareUrl} />
            </header>

            <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl bg-muted shadow-sm">
              <Image
                src={news.thumbnailUrl ?? "/images/hero-2.avif"}
                alt={news.title}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover"
                priority
              />
            </div>

            <ArticleContent value={news.content} />

            <CommentWrapper slug={slug} />
          </article>

          <aside className="space-y-10 lg:sticky lg:top-32 lg:self-start">
            {relatedNews.length > 0 ? (
              <section aria-labelledby="related-heading">
                <h2
                  id="related-heading"
                  className="text-sm font-semibold text-secondary"
                >
                  Berita terkait
                </h2>
                <ul className="mt-4 space-y-5">
                  {relatedNews.map((related) => (
                    <li key={related.slug}>
                      <Link
                        href={`/articles/${related.slug}`}
                        className="group flex gap-4"
                      >
                        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={related.thumbnailUrl ?? "/images/hero-2.avif"}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            {formatDateLabel(related.publishedAt ?? related.createdAt)}
                          </p>
                          <p className="text-sm font-semibold leading-snug text-secondary transition-colors group-hover:text-primary line-clamp-3">
                            {related.title}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/articles"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Lihat semua berita
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </section>
            ) : null}

            <section aria-labelledby="quick-heading">
              <h2
                id="quick-heading"
                className="text-sm font-semibold text-secondary"
              >
                Aksi cepat
              </h2>
              <ul className="mt-4 space-y-2">
                {quickActions.map((action) => (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className="group flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3.5 transition-colors hover:bg-muted"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <action.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-secondary">
                          {action.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {action.description}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
