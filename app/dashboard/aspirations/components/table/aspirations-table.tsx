"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useColumns } from "./columns";
import { DeleteDialog } from "../dialogs/delete-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AspirationStatus = "pending" | "in_progress" | "completed" | "rejected";

export type Aspiration = {
  id: string;
  submitterName: string;
  description: string;
  status: AspirationStatus;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

type AspirationListResponse = {
  aspirations: Aspiration[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

async function fetchAspirations(params: {
  page: number;
  limit: number;
  q?: string;
  status?: string;
}): Promise<AspirationListResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  if (params.q) searchParams.set("q", params.q);
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  const res = await fetch(`/api/dashboard/aspirations?${searchParams.toString()}`);
  const json = await res.json().catch(() => null);

  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat daftar aspirasi.");
  }

  return json.data as AspirationListResponse;
}

export function AspirationsTable() {
  const columns = useColumns();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("all"),
  );

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isFetching: isLoading } = useQuery({
    queryKey: ["dashboard", "aspirations", page, limit, q, status],
    queryFn: () =>
      fetchAspirations({
        page,
        limit,
        q: q || undefined,
        status,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  if (!data) {
    return <TableSkeleton />;
  }

  const rows = data.aspirations ?? [];
  const selectedIds = Object.keys(rowSelection)
    .map((index) => rows[parseInt(index)]?.id)
    .filter(Boolean);

  const selectedName =
    selectedIds.length === 1
      ? rows.find((a) => a.id === selectedIds[0])?.submitterName
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select
          value={status || "all"}
          onValueChange={(val) => setStatus(val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">Diproses</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} aspirasi dipilih
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
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={async (next) => {
          await setLimit(next);
          await setPage(1);
        }}
        searchKey="submitterName"
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
