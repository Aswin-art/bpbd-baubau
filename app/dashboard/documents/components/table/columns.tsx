"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { DocumentItem } from "./documents-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateTime } from "@/helpers/date";

export function useColumns(): ColumnDef<DocumentItem>[] {
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama & ringkasan" />
    ),
    cell: ({ row }) => {
      const doc = row.original;
      return (
        <div className="flex items-center gap-3 max-w-md">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random&color=fff&bold=true&length=1`}
              alt={doc.name}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm truncate">{doc.name}</span>
            {doc.description ? (
              <span className="text-xs text-muted-foreground line-clamp-2">
                {doc.description}
              </span>
            ) : null}
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
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize font-medium text-xs px-2.5 py-0.5">
        {row.original.category || "-"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dibuat pada" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {createdAt ? formatDateTime(createdAt) : "-"}
        </div>
      );
    },
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
    enableSorting: false,
    enableHiding: false,
  },
  ];
}
