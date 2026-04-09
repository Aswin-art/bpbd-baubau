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

export function BulkStatusDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onSuccess?: () => void;
}) {
  const { open, onOpenChange, ids, onSuccess } = props;
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<UserActiveValue>("true");

  useEffect(() => {
    if (open) setSelected("true");
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isActive: selected === "true" }),
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
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status User</DialogTitle>
          <DialogDescription>
            Perbarui status untuk <span className="font-semibold">{ids.length}</span>{" "}
            user yang dipilih.
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

