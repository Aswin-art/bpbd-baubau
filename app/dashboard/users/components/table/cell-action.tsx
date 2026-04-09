"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRow } from "./columns";
import { StatusDialog } from "../dialogs/status-dialog";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { UserFormDialog } from "../dialogs/user-form-dialog";

export function CellAction({ data }: { data: UserRow }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
          <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
            <button
              type="button"
              onClick={() => setEditDialogOpen(true)}
              className="cursor-pointer flex items-center w-full"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </button>
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
            Hapus user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        initial={data}
      />

      <StatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        ids={[data.id]}
        itemName={data.name}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ids={[data.id]}
        itemName={data.name}
      />
    </>
  );
}

