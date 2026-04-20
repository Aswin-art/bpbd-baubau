"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { DataTable } from "@/components/datatable/table-data";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useColumns, type UserRow } from "./columns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BulkStatusDialog } from "../dialogs/bulk-status-dialog";
import { BulkDeleteDialog } from "../dialogs/bulk-delete-dialog";

type UserListResponse = {
  users: UserRow[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

async function fetchUsers(params: {
  page: number;
  limit: number;
  q?: string;
  role?: string;
  isActive?: string;
}): Promise<UserListResponse> {
  const sp = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  if (params.q) sp.set("q", params.q);
  if (params.role) sp.set("role", params.role);
  if (params.isActive) sp.set("isActive", params.isActive);

  const res = await fetch(`/api/dashboard/users?${sp.toString()}`);
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat daftar users.");
  }
  return json.data as UserListResponse;
}

export function UsersTable() {
  const columns = useColumns();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [role, setRole] = useQueryState("role", parseAsString.withDefault("all"));
  const [isActive, setIsActive] = useQueryState(
    "isActive",
    parseAsString.withDefault("all"),
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data, isFetching: isLoading } = useQuery({
    queryKey: ["users", page, limit, q, role, isActive],
    queryFn: () =>
      fetchUsers({
        page,
        limit,
        q: q || undefined,
        role: role && role !== "all" ? role : undefined,
        isActive: isActive && isActive !== "all" ? isActive : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  if (!data) return <TableSkeleton />;

  const rows = data.users ?? [];
  const selectedIds = Object.keys(rowSelection)
    .map((index) => rows[parseInt(index)]?.id)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={role || "all"} onValueChange={(v) => setRole(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua role</SelectItem>
            <SelectItem value="admin">admin</SelectItem>
            <SelectItem value="operator">operator</SelectItem>
            <SelectItem value="kepala_bpbd">kepala_bpbd</SelectItem>
            <SelectItem value="masyarakat">masyarakat</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isActive || "all"} onValueChange={(v) => setIsActive(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} user dipilih
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkStatusOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              Ubah status
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
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
        searchKey="name"
        pageCount={data.pageCount}
        isLoading={isLoading}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      <BulkStatusDialog
        open={bulkStatusOpen}
        onOpenChange={setBulkStatusOpen}
        ids={selectedIds}
        onSuccess={() => setRowSelection({})}
      />
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        ids={selectedIds}
        onSuccess={() => setRowSelection({})}
      />
    </div>
  );
}

