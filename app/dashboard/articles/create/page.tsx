"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArticleForm } from "../components/article-form";
import { Separator } from "@/components/ui/separator";
import { PermissionGuard } from "../../components/permission-guard";
import { OperationErrorFallback } from "../../components/fallbacks/operation-error-fallback";

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

export default function CreateArticlePage() {
  const queryClient = useQueryClient();

  const {
    data: categories,
    isError,
    error,
  } = useSuspenseQuery({
    queryKey: ["article-categories"],
    queryFn: fetchCategories,
  });

  const handleCreateCategoryReset = () => {
    queryClient.invalidateQueries({ queryKey: ["article-categories"] });
  };

  return (
    <PermissionGuard resource="news" action="create">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Tambah artikel
            </h2>
            <p className="text-muted-foreground">
              Buat artikel baru untuk ditampilkan di portal.
            </p>
          </div>
        </div>
        <Separator />
        {isError ? (
          <OperationErrorFallback error={error as Error} reset={handleCreateCategoryReset} />
        ) : (
          <ArticleForm categories={categories} />
        )}
      </div>
    </PermissionGuard>
  );
}
