import { NextResponse } from "next/server";
import db from "@/lib/db";

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractHtmlFromContent(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && content && "html" in content) {
    const html = (content as { html?: unknown }).html;
    return typeof html === "string" ? html : "";
  }
  return "";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const article = await db.article.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      thumbnailUrl: true,
      category: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  if (!article || article.status !== "PUBLISHED") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? "",
      category: article.category,
      imageUrl: article.thumbnailUrl ?? "/images/hero-2.avif",
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      dateLabel: formatDateLabel(article.publishedAt ?? article.createdAt),
      authorName: article.author?.name ?? null,
      contentHtml: extractHtmlFromContent(article.content),
    },
  });
}

