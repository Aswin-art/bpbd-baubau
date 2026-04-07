"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { DeleteDialog } from "../dialogs/delete-dialog";

interface CellActionProps {
  data: MapDisasterPointDTO;
}

export function CellAction({ data }: CellActionProps) {
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
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/map/${data.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/arsip" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Lihat di Peta Publik
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        pointLabel={`${data.type} — ${data.location}`}
        onConfirm={() => {
          console.log("Delete disaster point:", data.id);
          setDeleteDialogOpen(false);
        }}
      />
    </>
  );
}
