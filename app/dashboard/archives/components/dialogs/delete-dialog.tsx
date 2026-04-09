"use client";

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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

  const mutation = useMutation({
    mutationFn: async () => {
      if (ids.length === 1) {
        const res = await fetch(`/api/dashboard/archives/${ids[0]}`, {
          method: "DELETE",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.status !== "success") {
          throw new Error(json?.message || "Gagal menghapus arsip.");
        }
        return json.data;
      }

      const res = await fetch("/api/dashboard/archives", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menghapus arsip.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["archives"] }),
        queryClient.invalidateQueries({ queryKey: ["archives", "stats"] }),
      ]);
      toast.success("Arsip berhasil dihapus.");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus arsip</AlertDialogTitle>
          <AlertDialogDescription>
            {ids.length > 1
              ? `Anda yakin ingin menghapus ${ids.length} arsip yang dipilih? Tindakan ini tidak dapat dibatalkan.`
              : `Anda yakin ingin menghapus arsip "${itemName || ""}"? Tindakan ini tidak dapat dibatalkan.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || ids.length === 0}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mutation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
