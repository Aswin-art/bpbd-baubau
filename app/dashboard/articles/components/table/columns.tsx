"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { formatDateTime } from "@/helpers/date";
import { shimmerPlaceholder } from "@/helpers/image-placeholder";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CellAction } from "./cell-action";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { Article } from "@/modules/articles";

export type { Article };

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

export function useColumns(): ColumnDef<Article>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Pilih semua"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Pilih baris"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Judul" />
      ),
      cell: ({ row }) => {
        const article = row.original;
        return (
          <div className="flex items-center gap-3 max-w-md">
            {article.thumbnailUrl ? (
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={article.thumbnailUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  loading="lazy"
                  blurDataURL={shimmerPlaceholder(64, 48)}
                />
              </div>
            ) : (
              <div className="h-12 w-16 shrink-0 rounded-md border bg-muted flex items-center justify-center relative overflow-hidden">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.title)}&background=random&color=fff&bold=true&length=1`}
                  alt={article.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">
                {article.title}
              </span>
              {article.excerpt && (
                <span className="text-xs text-muted-foreground truncate">
                  {article.excerpt}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kategori" />
      ),
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <Badge
            variant="outline"
            className="capitalize font-medium text-xs px-2.5 py-0.5"
          >
            {category}
          </Badge>
        );
      },
    },
    {
      id: "commentCount",
      accessorFn: (row) => row.commentCount ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Komentar" />
      ),
      cell: ({ row }) => {
        const n = (row.original.commentCount ?? 0) as number;
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
            {n}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusLabel =
          status === "PUBLISHED"
            ? "Dipublikasikan"
            : status === "DRAFT"
              ? "Draf"
              : status === "ARCHIVED"
                ? "Diarsipkan"
                : status;
        return (
          <Badge
            variant={statusVariantMap[status] || "outline"}
            className="capitalize shadow-sm rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {statusLabel}
          </Badge>
        );
      },
    },
    {
      accessorKey: "authorName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Penulis" />
      ),
      cell: ({ row }) => {
        const authorName = row.getValue("authorName") as string | undefined;
        return (
          <span className="text-sm text-muted-foreground">
            {authorName || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Dipublikasikan pada"
        />
      ),
      cell: ({ row }) => {
        const publishedAt = row.getValue("publishedAt") as string | null;
        return (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {publishedAt ? formatDateTime(publishedAt) : "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const article = row.original;
        return <CellAction article={article} />;
      },
    },
  ];
}
