"use client";

import { useState } from "react";
import { MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Aspiration } from "@/data/dummy-data";
import { StatusDialog } from "@/app/dashboard/aspirations/components/dialogs/status-dialog";
import { DeleteDialog } from "@/app/dashboard/aspirations/components/dialogs/delete-dialog";

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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Buka menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Ubah Status
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={data.status}
        submitterName={data.submitterName}
        onConfirm={(newStatus) => {
          console.log("Status updated:", data.id, "→", newStatus);
        }}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        submitterName={data.submitterName}
        onConfirm={() => {
          console.log("Deleted aspiration:", data.id);
        }}
      />
    </>
  );
}
