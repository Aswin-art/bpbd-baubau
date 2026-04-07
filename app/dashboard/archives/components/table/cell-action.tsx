"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ArchiveDocument } from "@/data/dummy-data";
import { DeleteDialog } from "../dialogs/delete-dialog";

interface CellActionProps {
  data: ArchiveDocument;
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
            <Link href={`/dashboard/archives/${data.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={data.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download
            </a>
          </DropdownMenuItem>
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
        documentName={data.name}
        onConfirm={() => {
          console.log("Deleting archive:", data.id);
          setDeleteDialogOpen(false);
        }}
      />
    </>
  );
}
