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
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import type { MyAspirationRow } from "./my-aspirations-table";

interface MyAspirationDeleteDialogProps {
  open: boolean;
  row: MyAspirationRow | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MyAspirationDeleteDialog({
  open,
  row,
  onOpenChange,
  onSuccess,
}: MyAspirationDeleteDialogProps) {
  const mutation = useMutation({
    mutationFn: async () => {
      if (!row) throw new Error("Tidak ada data.");
      const res = await fetch(`/api/dashboard/my-aspirations/${row.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menghapus aspirasi.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Aspirasi dihapus.");
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
          <AlertDialogTitle>Hapus aspirasi?</AlertDialogTitle>
          <AlertDialogDescription>
            Hanya aspirasi berstatus &quot;Menunggu&quot; yang dapat dihapus. Tindakan ini tidak
            dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending || !row}
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mutation.isPending ? "Menghapus…" : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
