"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardHeader } from "../../components/dashboard-header";
import { MapForm } from "../components/map-form";
import { PermissionGuard } from "../../components/permission-guard";

export default function CreateMapPointPage() {
  return (
    <PermissionGuard resource="map" action="create">
      <>
        <div className="mb-6">
          <Link
            href="/dashboard/map"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Map Bencana
          </Link>
        </div>
        <DashboardHeader
          title="Tambah Titik Bencana"
          description="Tambahkan titik kejadian baru pada peta bencana."
        />
        <MapForm />
      </>
    </PermissionGuard>
  );
}
