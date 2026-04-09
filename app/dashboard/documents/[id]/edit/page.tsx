"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentForm } from "../../components/document-form";
import { PermissionGuard } from "../../../components/permission-guard";

type Document = {
  id: string;
  name: string;
  description: string;
  category: "sop" | "regulasi" | "pedoman";
  dateLabel: string;
  fileSize: string;
  downloadUrl: string;
};

async function fetchDocument(id: string): Promise<Document | null> {
  const res = await fetch(`/api/dashboard/documents/${id}`);
  if (res.status === 404) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat data dokumen.");
  }
  return json.data as Document;
}

export default function EditDocumentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents", id],
    queryFn: () => fetchDocument(id),
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Terjadi kesalahan</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Gagal memuat data dokumen."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <PermissionGuard resource="documents" action="update">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Edit dokumen
            </h2>
            <p className="text-muted-foreground">
              Perbarui informasi dokumen untuk unduhan publik.
            </p>
          </div>
        </div>
        <Separator />
        <DocumentForm
          mode="edit"
          documentId={data.id}
          initialData={{
            name: data.name,
            description: data.description,
            category: data.category,
            dateLabel: data.dateLabel,
            fileSize: data.fileSize,
            downloadUrl: data.downloadUrl,
          }}
        />
      </div>
    </PermissionGuard>
  );
}

