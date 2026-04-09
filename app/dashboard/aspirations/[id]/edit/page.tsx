"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound } from "next/navigation";

import { AspirationForm } from "../../components/aspiration-form";
import { PermissionGuard } from "../../../components/permission-guard";

type Aspiration = {
  id: string;
  submitterName: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
};

async function fetchAspiration(id: string): Promise<Aspiration | null> {
  const res = await fetch(`/api/dashboard/aspirations/${id}`);
  if (res.status === 404) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat data aspirasi.");
  }
  return json.data as Aspiration;
}

export default function EditAspirationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["aspirations", id],
    queryFn: () => fetchAspiration(id),
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
            {error instanceof Error ? error.message : "Gagal memuat data aspirasi."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <PermissionGuard resource="aspirations" action="update">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Edit aspirasi
            </h2>
            <p className="text-muted-foreground">
              Perbarui data aspirasi dan status penanganannya.
            </p>
          </div>
        </div>
        <Separator />
        <AspirationForm
          mode="edit"
          aspirationId={data.id}
          initialData={{
            submitterName: data.submitterName,
            description: data.description,
            status: data.status,
          }}
        />
      </div>
    </PermissionGuard>
  );
}

