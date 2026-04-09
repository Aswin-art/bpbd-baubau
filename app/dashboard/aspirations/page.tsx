"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AspirationsTable } from "./components/table/aspirations-table";
import { AspirationCards } from "./components/aspiration-cards";
import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { TableSkeleton } from "../components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "../components/permission-guard";

export default function DashboardAspirationsPage() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="aspirations" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Aspirasi
            </h2>
            <p className="text-muted-foreground">
              Laporan dan masukan masyarakat terkait kebencanaan.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-sm">
            <Link href="/dashboard/aspirations/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah aspirasi
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
            <AspirationCards />
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
              <AspirationsTable />
            </Suspense>
          </ErrorBoundary>
        </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
