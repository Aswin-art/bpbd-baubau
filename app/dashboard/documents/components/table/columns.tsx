"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { DocumentItem } from "@/data/dummy-data";
import { CellAction } from "./cell-action";

const catLabel: Record<DocumentItem["category"], string> = {
  sop: "SOP",
  regulasi: "Regulasi",
  pedoman: "Pedoman",
};

export const columns: ColumnDef<DocumentItem, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama dokumen" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {row.original.description}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] font-semibold">
        {catLabel[row.original.category]}
      </Badge>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
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
    header: "",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
