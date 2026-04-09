"use client";

import { ErrorBoundary } from "react-error-boundary";
import { DashboardHeader } from "../components/dashboard-header";
import { MapTable } from "./components/table/map-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { PermissionGuard } from "../components/permission-guard";

export default function DashboardMapPage() {
  return (
    <PermissionGuard resource="map" action="read">
      <>
        <DashboardHeader
          title="Map Bencana"
          description="Kelola titik kejadian di peta. Data ini tidak sama dengan arsip laporan tahunan."
        />
        <ErrorBoundary FallbackComponent={TableErrorFallback}>
          <MapTable />
        </ErrorBoundary>
      </>
    </PermissionGuard>
  );
}
