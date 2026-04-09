"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ArchivesTable } from "./components/table/archives-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { TableSkeleton } from "../components/skeletons/table-skeleton";
import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { ArchiveCards } from "./components/archive-cards";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "../components/permission-guard";

export default function DashboardArchivesPage() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="archives" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Arsip Bencana
            </h2>
            <p className="text-muted-foreground">
              Laporan dan rekapitulasi tahunan. Data ini tidak sama dengan titik peta (kelola di Map Bencana).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" variant="outline" className="shadow-sm" asChild>
              <Link href="/dashboard/map">Map Bencana (titik)</Link>
            </Button>
            <Button asChild size="lg" className="shadow-sm">
              <Link href="/dashboard/archives/create">
                <Plus className="mr-2 h-4 w-4" />
                Tambah arsip
              </Link>
            </Button>
          </div>
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
            <ArchiveCards />
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
              <ArchivesTable />
            </Suspense>
          </ErrorBoundary>
        </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
