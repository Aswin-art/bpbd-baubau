"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { NewsArticle } from "@/data/dummy-data";
import { CellAction } from "./cell-action";

const categoryLabel: Record<string, string> = {
  edukasi: "Edukasi",
  "siaran-pers": "Siaran Pers",
  "berita-utama": "Berita Utama",
};

export const columns: ColumnDef<NewsArticle, unknown>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Judul" />
    ),
    cell: ({ row }) => (
      <span className="font-medium max-w-[280px] line-clamp-2">
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] font-semibold">
        {categoryLabel[row.original.category] ?? row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: "dateLabel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
  },
  {
    accessorKey: "excerpt",
    header: "Ringkasan",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm max-w-[320px] line-clamp-2">
        {row.original.excerpt}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "portal",
    header: "",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link
          href={`/berita/${row.original.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-1"
        >
          Portal
          <ExternalLink className="h-3 w-3" />
        </Link>
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
