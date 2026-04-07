"use client";

import { ErrorBoundary } from "react-error-boundary";
import { DashboardHeader } from "../dashboard-header";
import { NewsTable } from "./components/table/news-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";

export default function DashboardNewsPage() {
  return (
    <>
      <DashboardHeader
        title="Berita"
        description="Kelola artikel dan siaran pers yang tampil di portal publik."
      />
      <ErrorBoundary FallbackComponent={TableErrorFallback}>
        <NewsTable />
      </ErrorBoundary>
    </>
  );
}
