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

type UserActiveValue = "true" | "false";

const LABELS: Record<UserActiveValue, string> = {
  true: "Aktif",
  false: "Nonaktif",
};

export function StatusDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  itemName?: string;
  onSuccess?: () => void;
}) {
  const { open, onOpenChange, ids, itemName, onSuccess } = props;
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<UserActiveValue>("true");

  useEffect(() => {
    if (open) setSelected("true");
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () => {
      // Only single update for now (same as per-row action).
      const id = ids[0];
      if (!id) throw new Error("Missing user id");

      const res = await fetch(`/api/dashboard/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: selected === "true" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal mengubah status user.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Status user berhasil diperbarui.");
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
          <DialogTitle>Ubah Status User</DialogTitle>
          <DialogDescription>
            Perbarui status user{" "}
            <span className="font-semibold text-foreground">
              {itemName ? `"${itemName}"` : ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selected} onValueChange={(v) => setSelected(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">{LABELS.true}</SelectItem>
              <SelectItem value="false">{LABELS.false}</SelectItem>
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
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || ids.length === 0}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

