"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDialog } from "@/app/dashboard/aspirations/components/dialogs/status-dialog";
import { DeleteDialog } from "@/app/dashboard/aspirations/components/dialogs/delete-dialog";
import type { Aspiration } from "./aspirations-table";

interface CellActionProps {
  data: Aspiration;
}

export function CellAction({ data }: CellActionProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/aspirations/${data.id}/edit`}
              className="cursor-pointer flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit aspirasi
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setStatusDialogOpen(true)}
            className="cursor-pointer text-blue-600 focus:text-blue-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Ubah status
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus aspirasi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        ids={[data.id]}
        itemName={data.submitterName}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ids={[data.id]}
        itemName={data.submitterName}
      />
    </>
  );
}
