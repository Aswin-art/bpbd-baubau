"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import { type Aspiration, aspirationStatusLabels } from "@/data/dummy-data";
import { cn } from "@/lib/utils";
import { CellAction } from "./cell-action";

const statusStyle: Record<
  Aspiration["status"],
  { className: string }
> = {
  pending: {
    className: "bg-amber-50 text-amber-800 border-amber-200/60",
  },
  in_progress: {
    className: "bg-blue-50 text-blue-800 border-blue-200/60",
  },
  completed: {
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
  },
  rejected: {
    className: "bg-red-50 text-red-800 border-red-200/60",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const columns: ColumnDef<Aspiration, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.id}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "submitterName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.submitterName}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-[300px] line-clamp-2">
        {row.original.description.text}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const st = statusStyle[row.original.status];
      return (
        <Badge
          variant="outline"
          className={cn("text-[10px] font-semibold border", st.className)}
        >
          {aspirationStatusLabels[row.original.status]}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
