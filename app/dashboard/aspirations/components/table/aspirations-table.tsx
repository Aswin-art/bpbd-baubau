"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useColumns } from "./columns";
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
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("all"),
  );

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

      <DataTable
        columns={columns}
        data={rows}
        searchKey="submitterName"
        isLoading={isLoading}
        pageCount={data.pageCount}
      />
    </div>
  );
}
