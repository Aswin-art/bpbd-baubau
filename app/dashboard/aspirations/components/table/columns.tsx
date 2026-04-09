"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import { formatDateTime } from "@/helpers/date";
import { CellAction } from "./cell-action";
import type { Aspiration } from "./aspirations-table";
import { cn } from "@/lib/utils";

export type { Aspiration };

const aspirationStatusLabels: Record<Aspiration["status"], string> = {
  pending: "Pending",
  in_progress: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};

const statusStyle: Record<
  Aspiration["status"],
  { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  pending: {
    variant: "outline",
    className: "bg-amber-50 text-amber-800 border-amber-200/60",
  },
  in_progress: {
    variant: "outline",
    className: "bg-blue-50 text-blue-800 border-blue-200/60",
  },
  completed: {
    variant: "outline",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
  },
  rejected: {
    variant: "outline",
    className: "bg-red-50 text-red-800 border-red-200/60",
  },
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
        const style = statusStyle[st];
        return (
          <Badge
            variant={style?.variant || "outline"}
            className={cn(
              "capitalize shadow-sm rounded-full px-2.5 py-0.5 text-xs font-medium",
              style?.className,
            )}
          >
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
