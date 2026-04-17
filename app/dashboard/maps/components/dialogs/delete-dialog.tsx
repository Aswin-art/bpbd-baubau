"use client";

import {
  AlertDialog,
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
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  itemName?: string;
  onSuccess?: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  ids,
  itemName,
  onSuccess,
}: DeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!ids.length) return { count: 0 };

      const res = await fetch("/api/dashboard/maps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menghapus titik bencana.");
      }
      return json.data as { count: number; ids: string[] };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "map"] });
      toast.success(
        result.count === 1
          ? "Titik bencana berhasil dihapus."
          : `${result.count} titik bencana berhasil dihapus.`,
      );
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Titik Bencana</AlertDialogTitle>
          <AlertDialogDescription>
            {ids.length <= 1 ? (
              <>
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-foreground">
                  {itemName ? `“${itemName}”` : "titik ini"}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-foreground">
                  {ids.length} titik bencana
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending || ids.length === 0}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
