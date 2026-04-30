"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDateTime } from "@/helpers/date";

import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";

import { MyAspirationDetailSheet } from "./my-aspiration-detail-sheet";
import { MyAspirationFormDialog } from "./my-aspiration-form-dialog";
import { MyAspirationDeleteDialog } from "./my-aspiration-delete-dialog";
import { canMasyarakatEditAspiration } from "./can-masyarakat-edit-aspiration";

export type MyAspirationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected";

export type MyAspirationRow = {
  id: string;
  submitterName: string;
  description: string;
  status: MyAspirationStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  aspirations: MyAspirationRow[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

const statusLabel: Record<MyAspirationStatus, string> = {
  pending: "Menunggu",
  in_progress: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};

async function fetchList(params: {
  page: number;
  limit: number;
  q?: string;
  status: string;
}): Promise<ListResponse> {
  const sp = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.q) sp.set("q", params.q);
  if (params.status && params.status !== "all") sp.set("status", params.status);

  const res = await fetch(`/api/dashboard/my-aspirations?${sp.toString()}`);
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat aspirasi.");
  }
  return json.data as ListResponse;
}

export function MyAspirationsTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"));

  const [detailId, setDetailId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editRow, setEditRow] = useState<MyAspirationRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<MyAspirationRow | null>(null);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", "my-aspirations"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "my-aspirations", "stats"] }),
    ]);

  const { data, isFetching } = useQuery({
    queryKey: ["dashboard", "my-aspirations", "list", page, limit, q, status],
    queryFn: () =>
      fetchList({
        page,
        limit,
        q: q || undefined,
        status,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  const detailQuery = useQuery({
    queryKey: ["dashboard", "my-aspirations", "detail", detailId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/my-aspirations/${detailId}`);
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal memuat detail.");
      }
      return json.data as MyAspirationRow;
    },
    enabled: Boolean(detailId),
  });

  const columns = useMemo<ColumnDef<MyAspirationRow>[]>(
    () => [
      {
        accessorKey: "submitterName",
        header: "Nama",
        cell: ({ row }) => (
          <span className="font-medium line-clamp-1">{row.original.submitterName}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Ringkasan",
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-2 max-w-[280px] text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {statusLabel[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const r = row.original;
          const canMutate = canMasyarakatEditAspiration(r);
          return (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDetailId(r.id)}
                aria-label="Lihat detail"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {canMutate ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditRow(r);
                      setFormMode("edit");
                    }}
                    aria-label="Ubah"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteRow(r)}
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [],
  );

  if (!data) return <TableSkeleton />;

  const rows = data.aspirations ?? [];
  const detailAspiration =
    detailQuery.data?.id === detailId ? detailQuery.data : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <Select
          value={status || "all"}
          onValueChange={(val) => {
            void setStatus(val);
            void setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="in_progress">Diproses</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={() => setFormMode("create")}>
          Kirim aspirasi baru
        </Button>
      </div>

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
        isLoading={isFetching}
        pageCount={data.pageCount}
        withViewOptions={false}
      />

      <MyAspirationDetailSheet
        open={Boolean(detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        aspiration={detailAspiration}
        isLoading={detailQuery.isFetching && Boolean(detailId)}
        onEdit={(row) => {
          setDetailId(null);
          setEditRow(row);
          setFormMode("edit");
        }}
      />

      <MyAspirationFormDialog
        open={formMode !== null}
        mode={formMode === "edit" ? "edit" : "create"}
        initial={editRow}
        onOpenChange={(open) => {
          if (!open) {
            setFormMode(null);
            setEditRow(null);
          }
        }}
        onSuccess={() => {
          void invalidate();
          setFormMode(null);
          setEditRow(null);
        }}
      />

      <MyAspirationDeleteDialog
        open={Boolean(deleteRow)}
        row={deleteRow}
        onOpenChange={(open) => {
          if (!open) setDeleteRow(null);
        }}
        onSuccess={() => {
          void invalidate();
          setDeleteRow(null);
        }}
      />
    </div>
  );
}
