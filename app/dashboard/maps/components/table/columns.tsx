"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { getMapTypeColor } from "@/lib/map-disaster-colors";
import { formatDate } from "@/helpers/date";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<MapDisasterPointDTO, unknown>[] = [
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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis" />
    ),
    cell: ({ row }) => (
      <Badge
        className="border-transparent text-[10px] font-semibold text-white"
        style={{
          backgroundColor: getMapTypeColor(
            row.original.type,
            row.original.typeColor,
          ),
        }}
        variant="outline"
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lokasi" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground max-w-[220px] line-clamp-2">
        {row.original.location}
      </span>
    ),
  },
  {
    accessorKey: "kecamatan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kecamatan" />
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return <span className="text-sm text-muted-foreground whitespace-nowrap">{date ? formatDate(date) : "-"}</span>;
    },
  },
  {
    id: "coordinate",
    header: "Koordinat",
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {row.original.lat.toFixed(4)}, {row.original.lng.toFixed(4)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "casualties",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Korban" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.casualties}</span>
    ),
  },
  {
    accessorKey: "displaced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mengungsi" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.displaced}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
