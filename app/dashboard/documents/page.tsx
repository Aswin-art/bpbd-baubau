"use client";

import { ErrorBoundary } from "react-error-boundary";
import { DashboardHeader } from "../dashboard-header";
import { DocumentsTable } from "./components/table/documents-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";

export default function DashboardDocumentsPage() {
  return (
    <>
      <DashboardHeader
        title="Dokumen"
        description="Dokumen SOP, regulasi, dan pedoman untuk unduhan publik."
      />
      <ErrorBoundary FallbackComponent={TableErrorFallback}>
        <DocumentsTable />
      </ErrorBoundary>
    </>
  );
}
