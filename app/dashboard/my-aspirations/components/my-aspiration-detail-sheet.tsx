"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import type { MyAspirationRow } from "./my-aspirations-table";
import { canMasyarakatEditAspiration } from "./can-masyarakat-edit-aspiration";

const statusLabel = {
  pending: "Menunggu",
  in_progress: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
} as const;

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface MyAspirationDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aspiration: MyAspirationRow | null;
  isLoading: boolean;
  onEdit: (row: MyAspirationRow) => void;
}

export function MyAspirationDetailSheet({
  open,
  onOpenChange,
  aspiration,
  isLoading,
  onEdit,
}: MyAspirationDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-4 sm:px-6 pb-8">
        <SheetHeader className="space-y-1.5">
          <SheetTitle>Detail aspirasi</SheetTitle>
          <SheetDescription>
            Status, riwayat singkat, dan balasan dari BPBD (jika ada).
          </SheetDescription>
        </SheetHeader>

        {isLoading || !aspiration ? (
          <div className="mt-6 space-y-3 px-1">
            <Skeleton className="h-8 w-2/3 max-w-xs" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2 justify-between px-1">
              <span className="font-semibold text-lg line-clamp-2">{aspiration.submitterName}</span>
              <Badge variant="secondary">{statusLabel[aspiration.status]}</Badge>
            </div>

            <div className="mx-1 sm:mx-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-3 sm:px-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Isi aspirasi
              </p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{aspiration.description}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Riwayat
              </p>
              <ul className="space-y-3 text-sm border rounded-lg p-3 bg-muted/30">
                <li>
                  <span className="text-muted-foreground">Dibuat: </span>
                  <span>{formatDt(aspiration.createdAt)}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Terakhir diperbarui: </span>
                  <span>{formatDt(aspiration.updatedAt)}</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Status saat ini: </span>
                  <span>{statusLabel[aspiration.status]}</span>
                </li>
              </ul>
            </div>

            {aspiration.adminReply ? (
              <div className="mx-1 sm:mx-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-0.5">
                  Balasan BPBD
                </p>
                <div className="rounded-lg border border-border/60 bg-card px-3 py-3 sm:px-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {aspiration.adminReply}
                </div>
                {aspiration.repliedAt ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    Dibalas pada {formatDt(aspiration.repliedAt)}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada balasan resmi dari BPBD untuk aspirasi ini.
              </p>
            )}

            <Separator />

            {canMasyarakatEditAspiration(aspiration) ? (
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                onClick={() => onEdit(aspiration)}
              >
                Ubah aspirasi
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {aspiration.adminReply?.trim() || aspiration.repliedAt
                  ? "Aspirasi yang sudah dibalas BPBD tidak dapat diubah atau dihapus."
                  : 'Pengubahan dan penghapusan hanya tersedia saat status masih "Menunggu" dan belum ada balasan.'}
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
