"use client";

import { ErrorBoundary } from "react-error-boundary";
import { DashboardHeader } from "../dashboard-header";
import { MapTable } from "./components/table/map-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";

export default function DashboardMapPage() {
  return (
    <>
      <DashboardHeader
        title="Map Bencana"
        description="Kelola titik kejadian di peta. Data ini tidak sama dengan arsip laporan tahunan."
      />
      <ErrorBoundary FallbackComponent={TableErrorFallback}>
        <MapTable />
      </ErrorBoundary>
    </>
  );
}
