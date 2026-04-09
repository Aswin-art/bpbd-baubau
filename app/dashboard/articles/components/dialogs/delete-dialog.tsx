"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

async function deleteArticle(id: string) {
  const res = await fetch(`/api/dashboard/articles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal menghapus artikel.");
  }
  return res.json();
}

async function bulkDeleteArticles(ids: string[]) {
  const res = await fetch("/api/dashboard/articles", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal menghapus artikel.");
  }
  return res.json();
}

export function DeleteDialog({
  open,
  onOpenChange,
  ids,
  itemName,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  itemName?: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (ids.length === 1) {
        return deleteArticle(ids[0]);
      }

      return bulkDeleteArticles(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(
        ids.length > 1
          ? "Artikel berhasil dihapus."
          : "Artikel berhasil dihapus.",
      );
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = deleteMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus artikel</AlertDialogTitle>
          <AlertDialogDescription>
            {ids.length > 1
              ? `Anda yakin ingin menghapus ${ids.length} artikel yang dipilih? Tindakan ini tidak bisa dibatalkan.`
              : `Anda yakin ingin menghapus "${itemName || ""}"? Tindakan ini tidak bisa dibatalkan.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {deleteMutation.isPending ? "Menghapus..." : "Hapus artikel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
