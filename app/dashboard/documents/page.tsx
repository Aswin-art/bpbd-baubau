"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DocumentsTable } from "./components/table/documents-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { TableSkeleton } from "../components/skeletons/table-skeleton";
import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { DocumentCards } from "./components/document-cards";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "../components/permission-guard";

export default function DashboardDocumentsPage() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="documents" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Dokumen
            </h2>
            <p className="text-muted-foreground">
              Dokumen SOP, regulasi, dan pedoman untuk unduhan publik.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-sm">
            <Link href="/dashboard/documents/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah dokumen
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
            <DocumentCards />
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
              <DocumentsTable />
            </Suspense>
          </ErrorBoundary>
        </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
