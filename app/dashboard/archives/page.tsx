"use client";

import { ErrorBoundary } from "react-error-boundary";
import { DashboardHeader } from "../dashboard-header";
import { ArchivesTable } from "./components/table/archives-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";

export default function DashboardArchivesPage() {
  return (
    <>
      <DashboardHeader
        title="Arsip Bencana"
        description="Laporan dan rekapitulasi tahunan. Data ini tidak sama dengan titik peta (kelola di Map Bencana)."
      />
      <ErrorBoundary FallbackComponent={TableErrorFallback}>
        <ArchivesTable />
      </ErrorBoundary>
    </>
  );
}
