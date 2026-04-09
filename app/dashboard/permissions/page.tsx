"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";

import { PermissionGuard } from "../components/permission-guard";
import { RoleCards } from "./components/permission-cards";
import { RoleGrid } from "./components/permission-grid";
import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { TableSkeleton } from "../components/skeletons/table-skeleton";

export default function DashboardPermissionsPage() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="permissions" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Permissions
          </h2>
          <p className="text-muted-foreground">
            Kelola izin akses berdasarkan role.
          </p>
        </div>

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
            <RoleCards />
          </Suspense>
        </ErrorBoundary>

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
            <RoleGrid />
          </Suspense>
        </ErrorBoundary>
      </div>
    </PermissionGuard>
  );
}

