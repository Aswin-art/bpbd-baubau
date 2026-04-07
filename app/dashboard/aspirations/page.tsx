"use client";

import { ErrorBoundary } from "react-error-boundary";
import { DashboardHeader } from "../dashboard-header";
import { AspirationsTable } from "./components/table/aspirations-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";

export default function DashboardAspirationsPage() {
  return (
    <>
      <DashboardHeader
        title="Aspirasi"
        description="Laporan dan masukan masyarakat terkait kebencanaan."
      />
      <ErrorBoundary FallbackComponent={TableErrorFallback}>
        <AspirationsTable />
      </ErrorBoundary>
    </>
  );
}
