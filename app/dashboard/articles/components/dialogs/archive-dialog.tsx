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

async function archiveArticle(id: string) {
  const res = await fetch(`/api/dashboard/articles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "ARCHIVED" }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal mengarsipkan artikel.");
  }
  return res.json();
}

async function bulkArchiveArticles(ids: string[]) {
  const res = await fetch("/api/dashboard/articles", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids,
      action: "ARCHIVE",
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal mengarsipkan artikel.");
  }
  return res.json();
}

export function ArchiveDialog({
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

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (ids.length === 1) {
        return archiveArticle(ids[0]);
      }
      return bulkArchiveArticles(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(
        ids.length > 1
          ? "Artikel berhasil diarsipkan."
          : "Artikel berhasil diarsipkan.",
      );
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = archiveMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Arsipkan artikel
          </AlertDialogTitle>
          <AlertDialogDescription>
            {ids.length > 1
              ? `Anda yakin ingin mengarsipkan ${ids.length} artikel? Artikel akan disembunyikan dari portal publik.`
              : `Anda yakin ingin mengarsipkan "${itemName || ""}"? Artikel akan disembunyikan dari portal publik.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              archiveMutation.mutate();
            }}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Mengarsipkan..." : "Arsipkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
