"use client";

import { useState, useEffect } from "react";
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
import {
  type Aspiration,
  aspirationStatusLabels,
} from "@/data/dummy-data";

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: Aspiration["status"];
  submitterName: string;
  onConfirm: (newStatus: Aspiration["status"]) => void;
}

const statusOptions = Object.entries(aspirationStatusLabels) as [
  Aspiration["status"],
  string,
][];

export function StatusDialog({
  open,
  onOpenChange,
  currentStatus,
  submitterName,
  onConfirm,
}: StatusDialogProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<Aspiration["status"]>(currentStatus);

  useEffect(() => {
    if (open) setSelectedStatus(currentStatus);
  }, [open, currentStatus]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Aspirasi</DialogTitle>
          <DialogDescription>
            Perbarui status aspirasi dari{" "}
            <span className="font-semibold text-foreground">
              {submitterName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedStatus}
            onValueChange={(v) =>
              setSelectedStatus(v as Aspiration["status"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              console.log(
                "Update status for:",
                submitterName,
                "→",
                selectedStatus,
              );
              onConfirm(selectedStatus);
              onOpenChange(false);
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
