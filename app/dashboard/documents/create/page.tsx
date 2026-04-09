"use client";

import { Separator } from "@/components/ui/separator";
import { DocumentForm } from "../components/document-form";
import { PermissionGuard } from "../../components/permission-guard";

export default function CreateDocumentPage() {
  return (
    <PermissionGuard resource="documents" action="create">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Tambah dokumen
            </h2>
            <p className="text-muted-foreground">
              Tambahkan dokumen untuk unduhan publik (SOP, regulasi, pedoman).
            </p>
          </div>
        </div>
        <Separator />
        <DocumentForm mode="create" />
      </div>
    </PermissionGuard>
  );
}
