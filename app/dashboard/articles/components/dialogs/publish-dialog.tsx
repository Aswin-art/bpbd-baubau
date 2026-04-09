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

async function publishArticle(id: string, status: string = "PUBLISHED") {
  const res = await fetch(`/api/dashboard/articles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal memperbarui status publikasi.");
  }
  return res.json();
}

async function bulkPublishArticles(ids: string[]) {
  const res = await fetch("/api/dashboard/articles", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids,
      action: "PUBLISH",
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal memperbarui status publikasi.");
  }
  return res.json();
}

export function PublishDialog({
  open,
  onOpenChange,
  ids,
  itemName,
  isUnpublish = false,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  itemName?: string;
  isUnpublish?: boolean;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (ids.length === 1) {
        return publishArticle(ids[0], isUnpublish ? "DRAFT" : "PUBLISHED");
      }
      return bulkPublishArticles(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(
        isUnpublish
          ? "Publikasi artikel dibatalkan."
          : ids.length > 1
            ? "Artikel berhasil dipublikasikan."
            : "Artikel berhasil dipublikasikan.",
      );
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = publishMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUnpublish ? "Batalkan publikasi" : "Publikasikan artikel"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isUnpublish
              ? `Anda yakin ingin membatalkan publikasi "${itemName || ""}"? Artikel akan disembunyikan dari portal publik.`
              : ids.length > 1
                ? `Anda yakin ingin mempublikasikan ${ids.length} artikel? Artikel akan terlihat di portal publik.`
                : `Anda yakin ingin mempublikasikan "${itemName || ""}"? Artikel akan terlihat di portal publik.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              publishMutation.mutate();
            }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? isUnpublish
                ? "Membatalkan..."
                : "Mempublikasikan..."
              : isUnpublish
                ? "Batalkan publikasi"
                : "Publikasikan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
