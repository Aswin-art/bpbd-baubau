"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { useColumns } from "./columns";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useState } from "react";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { SearchSelect } from "@/components/ui/search-select";

export type DocumentItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  dateLabel: string;
  fileSize: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
};

type DocumentListResponse = {
  documents: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

async function readApiJsonSafe(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    return { json: null as any, text };
  }
  const json = await res.json().catch(() => null);
  return { json, text: "" };
}

async function fetchDocuments(params: {
  page: number;
  limit: number;
  q?: string;
  category?: string;
}): Promise<DocumentListResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);

  const res = await fetch(`/api/dashboard/documents?${searchParams.toString()}`);
  const { json, text } = await readApiJsonSafe(res);
  if (!res.ok || json?.status !== "success") {
    const extra =
      !json && text
        ? ` (non-JSON response, status ${res.status})`
        : ` (status ${res.status})`;
    throw new Error((json?.message || "Gagal memuat daftar dokumen.") + extra);
  }
  return json.data as DocumentListResponse;
}

export function DocumentsTable() {
  const columns = useColumns();
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault(""),
  );

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isFetching: isLoading } = useQuery({
    queryKey: ["documents", page, limit, q, category],
    queryFn: () =>
      fetchDocuments({
        page,
        limit,
        q: q || undefined,
        category: category ? category : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  if (!data) return <TableSkeleton />;

  const rows = data.documents ?? [];
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
        <SearchSelect
          apiEndpoint="/api/dashboard/documents/categories"
          placeholder="Semua kategori"
          value={category || null}
          onChange={(v) => setCategory(v || "")}
          creatable
          responseMapper={(data) => {
            const arr = Array.isArray(data) ? data : [];
            return arr
              .map((c) => String(c))
              .filter(Boolean)
              .map((c) => ({ id: c, label: c }));
          }}
        />
      </div>

      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} dokumen dipilih
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
