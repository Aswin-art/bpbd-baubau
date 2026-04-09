"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { CellAction } from "./cell-action";

const typeBadgeColor: Record<string, string> = {
  Banjir: "bg-blue-100 text-blue-800",
  "Tanah Longsor": "bg-amber-100 text-amber-800",
  "Angin Puting Beliung": "bg-violet-100 text-violet-800",
  Kebakaran: "bg-red-100 text-red-800",
  "Gelombang Tinggi": "bg-cyan-100 text-cyan-800",
};

export const columns: ColumnDef<MapDisasterPointDTO, unknown>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis" />
    ),
    cell: ({ row }) => (
      <Badge
        className={`text-[10px] font-semibold ${typeBadgeColor[row.original.type] ?? ""}`}
        variant="secondary"
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
