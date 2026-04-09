"use client";

import { Separator } from "@/components/ui/separator";
import { ArchiveForm } from "../components/archive-form";
import { PermissionGuard } from "../../components/permission-guard";

export default function CreateArchivePage() {
  return (
    <PermissionGuard resource="archives" action="create">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Tambah arsip
            </h2>
            <p className="text-muted-foreground">
              Tambahkan dokumen arsip (PDF) untuk laporan/rekap tahunan.
            </p>
          </div>
        </div>
        <Separator />
        <ArchiveForm mode="create" />
      </div>
    </PermissionGuard>
  );
}
