"use client";

import { MessageSquareText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { aspirations, type Aspiration } from "@/data/dummy-data";
import { columns } from "./columns";

async function fetchAspirations(): Promise<Aspiration[]> {
  await new Promise((r) => setTimeout(r, 600));
  return aspirations;
}

export function AspirationsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "aspirations"],
    queryFn: fetchAspirations,
  });

  if (isLoading) return <TableSkeleton />;

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} entri</p>
        <Button size="sm" className="gap-1.5" disabled>
          <MessageSquareText className="h-4 w-4" />
          Ekspor data
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchKey="submitterName"
        isLoading={isLoading}
      />
    </div>
  );
}
