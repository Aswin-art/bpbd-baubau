import { Button } from "@/components/ui/button";
import { useColumns } from "./columns";
import { DataTable } from "@/components/datatable/table-data";
import { useState } from "react";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { PublishDialog } from "../dialogs/publish-dialog";
import { ArchiveDialog } from "../dialogs/archive-dialog";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArticleListResponse } from "@/modules/articles";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";

const statusOptions = [
  { value: "all", label: "Semua status" },
  { value: "PUBLISHED", label: "Dipublikasikan" },
  { value: "DRAFT", label: "Draf" },
  { value: "ARCHIVED", label: "Diarsipkan" },
] as const;

async function fetchArticles(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  category?: string;
}): Promise<ArticleListResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });
  if (params.search) {
    searchParams.set("q", params.search);
  }
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params.category && params.category !== "all") {
    searchParams.set("category", params.category);
  }

  const res = await fetch(
    `/api/dashboard/articles?${searchParams.toString()}`,
  );
  if (!res.ok) {
    throw new Error("Gagal memuat daftar artikel.");
  }

  const json = await res.json();
  return json.data;
}

export function ArticleTable() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("all"),
  );

  const columns = useColumns();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const { data: articles, isFetching: isLoading } = useQuery({
    queryKey: ["articles", page, limit, search, status, category],
    queryFn: () =>
      fetchArticles({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        category,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/articles/categories");
      const json = await res.json();
      return json.data as string[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (!articles) {
    return <TableSkeleton />;
  }

  const selectedIds = Object.keys(rowSelection)
    .map((index) => articles.articles[parseInt(index)]?.id)
    .filter(Boolean);

  const selectedItemName =
    selectedIds.length === 1
      ? articles.articles.find((a) => a.id === selectedIds[0])?.title
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={category || "all"}
          onValueChange={(val) => {
            void setCategory(val === "all" ? null : val);
            void setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              Semua kategori
            </SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status || "all"}
          onValueChange={(val) => {
            void setStatus(val === "all" ? null : val);
            void setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} artikel dipilih
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPublishDialogOpen(true)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            >
              Publikasikan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setArchiveDialogOpen(true)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
            >
              Arsipkan
            </Button>
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
        data={articles.articles}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={async (next) => {
          await setLimit(next);
          await setPage(1);
        }}
        searchKey="title"
        pageCount={articles.pageCount}
        isLoading={isLoading}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ids={selectedIds}
        itemName={selectedItemName}
        onSuccess={() => setRowSelection({})}
      />
      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        ids={selectedIds}
        itemName={selectedItemName}
        onSuccess={() => setRowSelection({})}
      />
      <ArchiveDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        ids={selectedIds}
        itemName={selectedItemName}
        onSuccess={() => setRowSelection({})}
      />
    </div>
  );
}
