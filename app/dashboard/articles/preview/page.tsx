"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateArticleInput } from "@/modules/articles";
import { useRouter } from "next/navigation";
import { PermissionGuard } from "../../components/permission-guard";
import Wrapper from "@/components/wrapper";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

type ArticleViewData = {
  title: string;
  content: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  authorName?: string | null;
  publishedAt?: Date | string | null;
};

export default function ArticlePreviewPage() {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleViewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreviewData = () => {
      try {
        const data = localStorage.getItem("article_preview_data");
        if (!data) {
          router.push("/dashboard/articles/create");
          return;
        }

        const parsedData: CreateArticleInput = JSON.parse(data);

        // Transform to ArticleViewData format
        const previewArticle: ArticleViewData = {
          title: parsedData.title,
          content: parsedData.content,
          excerpt: parsedData.excerpt || null,
          thumbnailUrl: parsedData.thumbnailUrl || null,
          category: parsedData.category || "Uncategorized",
          authorName: "Pratinjau",
          publishedAt: null,
        };

        setArticle(previewArticle);
      } catch (error) {
        console.error("Failed to load preview data:", error);
        router.push("/dashboard/articles/create");
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, [router]);

  if (loading) {
    return (
    <PermissionGuard resource="articles" action="create">
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </PermissionGuard>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <PermissionGuard resource="articles" action="create">
      <div className="min-h-screen bg-background pt-24 pb-20 md:pt-28 xl:pt-32">
        <Wrapper className="max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard/articles/create"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Kembali
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("article_preview_data");
                window.close();
              }}
            >
              Tutup pratinjau
            </Button>
          </div>

          <div className="mt-6 rounded-xl bg-amber-500/15 text-amber-950 border border-amber-500/25 px-4 py-3 text-sm font-medium">
            Pratinjau — artikel ini belum dipublikasikan
          </div>

          <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">
            <article>
              <header className="space-y-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-medium text-primary">
                    {article.category || "Uncategorized"}
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <time>Pratinjau</time>
                </div>

                <h1 className="text-balance text-3xl font-bold leading-[1.12] tracking-[-0.03em] text-secondary sm:text-4xl lg:text-[2.75rem]">
                  {article.title}
                </h1>

                {article.excerpt ? (
                  <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {article.excerpt}
                  </p>
                ) : null}
              </header>

              {article.thumbnailUrl ? (
                <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl bg-muted shadow-sm">
                  <Image
                    src={article.thumbnailUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}

              <div className="mt-10">
                <Editor
                  value={article.content}
                  onChange={() => {}}
                  disabled={true}
                  className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-secondary prose-p:leading-relaxed prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:marker:text-primary/70"
                />
              </div>
            </article>

            <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-2xl border bg-muted/30 p-5">
                <p className="text-sm font-semibold text-secondary">
                  Info pratinjau
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tampilan ini mengikuti layout halaman publik. Konten dan gambar
                  diambil dari draft yang tersimpan di browser.
                </p>
              </div>
            </aside>
          </div>
        </Wrapper>
      </div>
    </PermissionGuard>
  );
}
