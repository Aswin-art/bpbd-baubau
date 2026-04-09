"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { useColumns } from "./columns";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteDialog } from "../dialogs/delete-dialog";

export type ArchiveDocument = {
  id: string;
  name: string;
  description: string;
  dateLabel: string;
  fileSize: string;
  year: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
};

type ArchiveListResponse = {
  archives: ArchiveDocument[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

async function fetchArchives(params: {
  page: number;
  limit: number;
  q?: string;
  year?: string;
}): Promise<ArchiveListResponse> {
  const sp = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  if (params.q) sp.set("q", params.q);
  if (params.year && params.year !== "all") sp.set("year", params.year);

  const res = await fetch(`/api/dashboard/archives?${sp.toString()}`);
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat daftar arsip.");
  }
  return json.data as ArchiveListResponse;
}

async function fetchYears(): Promise<string[]> {
  const res = await fetch("/api/dashboard/archives/years");
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat daftar tahun arsip.");
  }
  return json.data as string[];
}

export function ArchivesTable() {
  const columns = useColumns();
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [year, setYear] = useQueryState("year", parseAsString.withDefault("all"));

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["archives", "years"],
    queryFn: fetchYears,
    staleTime: 1000 * 60 * 10,
  });

  const { data, isFetching: isLoading } = useQuery({
    queryKey: ["archives", page, limit, q, year],
    queryFn: () =>
      fetchArchives({
        page,
        limit,
        q: q || undefined,
        year: year || undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  if (!data) return <TableSkeleton />;

  const rows = data.archives ?? [];
  const selectedIds = Object.keys(rowSelection)
    .map((index) => rows[parseInt(index)]?.id)
    .filter(Boolean);

  const selectedName =
    selectedIds.length === 1
      ? rows.find((d) => d.id === selectedIds[0])?.name
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={year || "all"} onValueChange={(v) => setYear(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua tahun</SelectItem>
              {yearsQuery.isLoading && (
                <SelectItem value="__loading" disabled>
                  Memuat daftar tahun...
                </SelectItem>
              )}
              {yearsQuery.isError && (
                <SelectItem value="__error" disabled>
                  Gagal memuat daftar tahun
                </SelectItem>
              )}
              {!yearsQuery.isLoading &&
                !yearsQuery.isError &&
                (yearsQuery.data ?? [])
                  .slice()
                  .sort((a, b) => (a > b ? -1 : 1))
                  .map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} arsip dipilih
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Hapus
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        isLoading={isLoading}
        pageCount={data.pageCount}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ids={selectedIds as string[]}
        itemName={selectedName}
        onSuccess={() => setRowSelection({})}
      />
    </div>
  );
}
