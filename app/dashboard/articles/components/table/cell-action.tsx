"use client";

import { useState } from "react";
import {
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Archive,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import type { Article } from "@/modules/articles";
import { DeleteDialog } from "../dialogs/delete-dialog";
import { PublishDialog } from "../dialogs/publish-dialog";
import { ArchiveDialog } from "../dialogs/archive-dialog";

interface CellActionProps {
  article: Article;
}

async function updateArticleStatus(id: string, status: string) {
  const res = await fetch(`/api/dashboard/articles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal memperbarui status artikel.");
  }
  return res.json();
}

export function CellAction({ article }: CellActionProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateArticleStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
        queryClient.invalidateQueries({ queryKey: ["article-stats"] }),
      ]);
      toast.success("Status artikel berhasil diperbarui.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
              href={`/dashboard/articles/${article.id}/edit`}
              className="cursor-pointer flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit artikel
            </Link>
          </DropdownMenuItem>

          {article.status !== "PUBLISHED" && (
            <DropdownMenuItem
              onClick={() => setPublishDialogOpen(true)}
              className="cursor-pointer text-green-600 focus:text-green-600"
            >
              <Eye className="mr-2 h-4 w-4" /> Publikasikan
            </DropdownMenuItem>
          )}

          {article.status === "PUBLISHED" && (
            <DropdownMenuItem
              onClick={() => setUnpublishDialogOpen(true)}
              className="cursor-pointer text-orange-600 focus:text-orange-600"
            >
              <EyeOff className="mr-2 h-4 w-4" /> Batalkan publikasi
            </DropdownMenuItem>
          )}

          {article.status !== "ARCHIVED" && (
            <DropdownMenuItem
              onClick={() => setArchiveDialogOpen(true)}
              className="cursor-pointer text-muted-foreground"
            >
              <Archive className="mr-2 h-4 w-4" /> Arsipkan
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus artikel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ids={[article.id]}
        itemName={article.title}
      />
      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        ids={[article.id]}
        itemName={article.title}
      />
      <PublishDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
        ids={[article.id]}
        itemName={article.title}
        isUnpublish={true}
      />
      <ArchiveDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        ids={[article.id]}
        itemName={article.title}
      />
    </>
  );
}
