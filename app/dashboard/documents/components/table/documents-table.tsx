"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { documents, type DocumentItem } from "@/data/dummy-data";
import { columns } from "./columns";

async function fetchDocuments(): Promise<DocumentItem[]> {
  await new Promise((r) => setTimeout(r, 600));
  return documents;
}

export function DocumentsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "documents"],
    queryFn: fetchDocuments,
  });

  if (isLoading) return <TableSkeleton />;

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} dokumen</p>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/dashboard/documents/create">
            <Plus className="h-4 w-4" />
            Tambah dokumen
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        isLoading={isLoading}
      />
    </div>
  );
}
