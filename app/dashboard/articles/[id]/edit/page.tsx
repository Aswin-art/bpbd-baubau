"use client";

import { useQueries } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { use } from "react";
import { ArticleForm } from "../../components/article-form";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/modules/articles";
import { notFound } from "next/navigation";
import { PermissionGuard } from "../../../components/permission-guard";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

async function fetchArticle(id: string): Promise<Article | null> {
  const res = await fetch(`/api/dashboard/articles/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    let errorMsg = "Gagal memuat artikel.";
    try {
      const errJson = await res.json();
      if (errJson.error?.message) {
        errorMsg = errJson.error.message;
      } else if (errJson.message) {
        errorMsg = errJson.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data;
}

async function fetchCategories(): Promise<string[]> {
  const res = await fetch("/api/dashboard/articles/categories");
  if (!res.ok) {
    let errorMsg = "Gagal memuat kategori.";
    try {
      const errJson = await res.json();
      if (errJson.error?.message) {
        errorMsg = errJson.error.message;
      } else if (errJson.message) {
        errorMsg = errJson.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = use(params);

  const [articleQuery, categoriesQuery] = useQueries({
    queries: [
      {
        queryKey: ["articles", id],
        queryFn: () => fetchArticle(id),
      },
      {
        queryKey: ["articles", "categories"],
        queryFn: fetchCategories,
      },
    ],
  });

  const isFetching = articleQuery.isFetching || categoriesQuery.isFetching;
  const isError = articleQuery.isError || categoriesQuery.isError;
  const error = articleQuery.error || categoriesQuery.error;

  if (isFetching) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Terjadi kesalahan</AlertTitle>
          <AlertDescription>
            {error?.message || "Gagal memuat data artikel."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const article = articleQuery.data;
  const categories = categoriesQuery.data;

  if (!article) {
    return notFound();
  }

  const initialData = {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || undefined,
    thumbnailUrl: article.thumbnailUrl || undefined,
    category: article.category,
    status: article.status,
  };

  return (
    <PermissionGuard resource="news" action="update">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Edit artikel
            </h2>
            <p className="text-muted-foreground">Perbarui konten artikel.</p>
          </div>
        </div>
        <Separator />
        <ArticleForm
          mode="edit"
          articleId={article.id}
          initialData={initialData}
          categories={categories}
        />
      </div>
    </PermissionGuard>
  );
}
