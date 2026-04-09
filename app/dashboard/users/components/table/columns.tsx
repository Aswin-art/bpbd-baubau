"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/datatable/table-header";
import { Checkbox } from "@/components/ui/checkbox";
import { CellAction } from "./cell-action";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function useColumns(): ColumnDef<UserRow>[] {
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
        <DataTableColumnHeader column={column} title="Nama & email" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3 max-w-md">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
              <Image
                src={
                  user.photoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&bold=true&length=1`
                }
                alt={user.name}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="capitalize font-medium text-xs px-2.5 py-0.5"
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.isActive
              ? "shadow-sm rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-800 border-emerald-200/60"
              : "shadow-sm rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-50 text-zinc-700 border-zinc-200/60"
          }
        >
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      accessorKey: "emailVerified",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verifikasi" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.emailVerified ? "Terverifikasi" : "Belum"}
        </span>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Login terakhir" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.lastLoginAt)}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dibuat" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <CellAction data={row.original} />,
    },
  ];
}

