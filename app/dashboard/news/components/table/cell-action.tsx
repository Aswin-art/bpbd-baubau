"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NewsArticle } from "@/data/dummy-data";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { PublishDialog } from "../dialogs/publish-dialog";

interface CellActionProps {
  data: NewsArticle;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

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
            <Link href={`/dashboard/news/${data.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPublishDialogOpen(true)}>
            {data.isPublished ? (
              <>
                <EyeOff className="h-4 w-4" />
                Tarik dari Portal
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Publikasikan
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/berita/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Lihat di Portal
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        articleTitle={data.title}
        onConfirm={() => {
          console.log("Delete article:", data.id);
          setDeleteDialogOpen(false);
        }}
      />

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        articleTitle={data.title}
        isPublished={data.isPublished}
        onConfirm={() => {
          console.log("Toggle publish:", data.id, !data.isPublished);
          setPublishDialogOpen(false);
        }}
      />
    </>
  );
}
