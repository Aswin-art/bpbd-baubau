"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";

import { PermissionGuard } from "../components/permission-guard";
import { DashboardHeader } from "../components/dashboard-header";
import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { MyAspirationStatsCards } from "./components/my-aspiration-stats-cards";
import { MyAspirationsTable } from "./components/my-aspirations-table";

export default function MyAspirationsPage() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="my_aspirations" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <DashboardHeader
          title="Aspirasi saya"
          description="Kelola aspirasi Anda: kirim baru, ubah atau hapus saat masih menunggu, pantau status, dan baca balasan BPBD."
        />

        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <CardsErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<CardsSkeleton />}>
            <MyAspirationStatsCards />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <TableErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <MyAspirationsTable />
        </ErrorBoundary>
      </div>
    </PermissionGuard>
  );
}
