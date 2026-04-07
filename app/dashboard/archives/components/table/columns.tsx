"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { ArchiveDocument } from "@/data/dummy-data";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<ArchiveDocument, unknown>[] = [
  {
    accessorKey: "year",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tahun arsip" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {row.original.year}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Judul laporan" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium max-w-[320px] line-clamp-2">
          {row.original.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {row.original.description.text}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "dateLabel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal dokumen" />
    ),
  },
  {
    accessorKey: "fileSize",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ukuran" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
