"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { archiveDocuments, type ArchiveDocument } from "@/data/dummy-data";
import { columns } from "./columns";

async function fetchArchives(): Promise<ArchiveDocument[]> {
  await new Promise((r) => setTimeout(r, 600));
  return archiveDocuments;
}

export function ArchivesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "archives"],
    queryFn: fetchArchives,
  });

  if (isLoading) return <TableSkeleton />;

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length} dokumen arsip
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href="/dashboard/map">
              Map Bencana (titik)
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/dashboard/archives/create">
              <Plus className="h-4 w-4" />
              Tambah arsip
            </Link>
          </Button>
        </div>
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
