"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { MyAspirationRow } from "./my-aspirations-table";

interface MyAspirationFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial: MyAspirationRow | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MyAspirationFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSuccess,
}: MyAspirationFormDialogProps) {
  const [submitterName, setSubmitterName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setSubmitterName(initial.submitterName);
      setDescription(initial.description);
    } else {
      setSubmitterName("");
      setDescription("");
    }
  }, [open, mode, initial]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") {
        const res = await fetch("/api/dashboard/my-aspirations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submitterName, description }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.status !== "success") {
          throw new Error(json?.message || "Gagal menyimpan.");
        }
        return json.data;
      }
      if (!initial) throw new Error("Data tidak valid.");
      const res = await fetch(`/api/dashboard/my-aspirations/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitterName, description }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal memperbarui.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success(mode === "create" ? "Aspirasi dikirim." : "Perubahan disimpan.");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Kirim aspirasi baru" : "Ubah aspirasi"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi data berikut. Setelah dikirim, status awal adalah Menunggu."
              : "Anda hanya dapat mengubah aspirasi yang masih menunggu dan belum mendapat balasan dari BPBD."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="my-asp-name">Nama / inisial</Label>
            <Input
              id="my-asp-name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="Nama yang ditampilkan"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="my-asp-desc">Deskripsi</Label>
            <Textarea
              id="my-asp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Jelaskan aspirasi atau laporan Anda"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mutation.isPending ? "Menyimpan…" : mode === "create" ? "Kirim" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
