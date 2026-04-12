"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import { formatDateTime } from "@/helpers/date";
import { CellAction } from "./cell-action";
import type { Aspiration } from "./aspirations-table";

export type { Aspiration };

const aspirationStatusLabels: Record<Aspiration["status"], string> = {
  pending: "Pending",
  in_progress: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};

function getDescriptionPreview(description: unknown): string {
  if (typeof description === "string") {
    const s = description.trim();
    if (s.startsWith("{") && s.endsWith("}")) {
      try {
        const parsed = JSON.parse(s) as { text?: unknown };
        if (typeof parsed?.text === "string") return parsed.text.trim();
      } catch {
        // ignore
      }
    }
    return s;
  }
  return "";
}

export function useColumns(): ColumnDef<Aspiration>[] {
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
      accessorKey: "submitterName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nama & ringkasan" />
      ),
      cell: ({ row }) => {
        const aspiration = row.original;
        const preview = getDescriptionPreview(aspiration.description);
        return (
          <div className="flex items-center gap-3 max-w-md">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(aspiration.submitterName)}&background=random&color=fff&bold=true&length=1`}
                alt={aspiration.submitterName}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">
                {aspiration.submitterName}
              </span>
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
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge variant="outline" className="capitalize font-medium text-xs px-2.5 py-0.5">
            {aspirationStatusLabels[st]}
          </Badge>
        );
      },
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
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <CellAction data={row.original} />,
    },
  ];
}
