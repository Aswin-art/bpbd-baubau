"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ArticleTable } from "./components/table/article-table";
import { ArticleCards } from "./components/article-cards";
import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { TableSkeleton } from "../components/skeletons/table-skeleton";
import { PermissionGuard } from "../components/permission-guard";

export default function Page() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="articles" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Artikel
            </h2>
            <p className="text-muted-foreground">
              Kelola artikel portal: buat, edit, publikasi, arsip, hapus, dan moderasi
              komentar.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-sm">
            <Link href="/dashboard/articles/create">
              <Plus className="mr-2 h-4 w-4" /> Tambah artikel
            </Link>
          </Button>
        </div>

        {/* Stats Section */}
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <CardsErrorFallback
              error={error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={<CardsSkeleton />}>
            <ArticleCards />
          </Suspense>
        </ErrorBoundary>

        {/* Table Section */}
        <div className="space-y-4">
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <TableErrorFallback
                error={error}
                resetErrorBoundary={resetErrorBoundary}
              />
            )}
          >
            <Suspense fallback={<TableSkeleton />}>
              <ArticleTable />
            </Suspense>
          </ErrorBoundary>
        </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
