"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AspirationStatus } from "../table/aspirations-table";

const STATUS_LABELS: Record<AspirationStatus, string> = {
  pending: "Pending",
  in_progress: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  itemName?: string;
  onSuccess?: () => void;
}

export function StatusDialog({
  open,
  onOpenChange,
  ids,
  itemName,
  onSuccess,
}: StatusDialogProps) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] =
    useState<AspirationStatus>("pending");

  useEffect(() => {
    if (open) setSelectedStatus("pending");
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/dashboard/aspirations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: selectedStatus }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal mengubah status aspirasi.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aspirations"] }),
        queryClient.invalidateQueries({ queryKey: ["aspirations", "stats"] }),
      ]);
      toast.success("Status aspirasi berhasil diperbarui.");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Aspirasi</DialogTitle>
          <DialogDescription>
            Perbarui status aspirasi{" "}
            <span className="font-semibold text-foreground">
              {itemName ? `"${itemName}"` : ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedStatus}
            onValueChange={(v) => setSelectedStatus(v as AspirationStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{STATUS_LABELS.pending}</SelectItem>
              <SelectItem value="in_progress">
                {STATUS_LABELS.in_progress}
              </SelectItem>
              <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
              <SelectItem value="rejected">{STATUS_LABELS.rejected}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={() => {
              mutation.mutate();
            }}
            disabled={mutation.isPending || ids.length === 0}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
