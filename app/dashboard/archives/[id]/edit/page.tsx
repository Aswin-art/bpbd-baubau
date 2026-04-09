"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArchiveForm } from "../../components/archive-form";
import { PermissionGuard } from "../../../components/permission-guard";

type Archive = {
  id: string;
  name: string;
  description: string;
  year: string;
  dateLabel: string;
  fileSize: string;
  downloadUrl: string;
};

async function fetchArchive(id: string): Promise<Archive | null> {
  const res = await fetch(`/api/dashboard/archives/${id}`);
  if (res.status === 404) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat data arsip.");
  }
  return json.data as Archive;
}

export default function EditArchivePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["archives", id],
    queryFn: () => fetchArchive(id),
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
            {error instanceof Error ? error.message : "Gagal memuat data arsip."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <PermissionGuard resource="archives" action="update">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Edit arsip
            </h2>
            <p className="text-muted-foreground">
              Perbarui informasi dokumen arsip.
            </p>
          </div>
        </div>
        <Separator />
        <ArchiveForm
          mode="edit"
          archiveId={data.id}
          initialData={{
            name: data.name,
            description: data.description,
            year: data.year,
            dateLabel: data.dateLabel,
            fileSize: data.fileSize,
            downloadUrl: data.downloadUrl,
          }}
        />
      </div>
    </PermissionGuard>
  );
}

