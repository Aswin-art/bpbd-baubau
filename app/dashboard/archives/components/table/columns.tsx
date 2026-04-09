"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import type { ArchiveDocument } from "./archives-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";

function getDescriptionPreview(description: unknown): string {
  if (typeof description === "string") {
    const s = description.trim();
    // DB stores TEXT; some records are JSON-stringified objects like {"text":"..."}.
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return getDescriptionPreview(JSON.parse(s));
      } catch {
        return s;
      }
    }
    return s;
  }
  if (description && typeof description === "object") {
    const maybeText = (description as any)?.text;
    if (typeof maybeText === "string") return maybeText;
  }
  return "";
}

export function useColumns(): ColumnDef<ArchiveDocument>[] {
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
      <DataTableColumnHeader column={column} title="Judul & ringkasan" />
    ),
    cell: ({ row }) => {
      const doc = row.original;
      const preview = getDescriptionPreview(doc.description);
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
            {preview ? (
              <span className="text-xs text-muted-foreground line-clamp-2">
                {preview}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
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
    enableSorting: false,
    enableHiding: false,
  },
  ];
}
