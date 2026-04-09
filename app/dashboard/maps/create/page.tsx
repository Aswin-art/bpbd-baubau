"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MapForm } from "../components/map-form";
import { PermissionGuard } from "../../components/permission-guard";

export default function CreateMapPointPage() {
  return (
    <PermissionGuard resource="maps" action="create">
      <>
        <div className="mb-6">
          <Link
            href="/dashboard/maps"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Map Bencana
          </Link>
        </div>
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tambah Titik Bencana
          </h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan titik kejadian baru pada peta bencana.
          </p>
        </div>
        <MapForm />
      </>
    </PermissionGuard>
  );
}
