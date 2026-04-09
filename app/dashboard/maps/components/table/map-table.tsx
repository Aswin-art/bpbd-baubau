"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { columns } from "./columns";
import { DisasterMap } from "@/app/(public)/archives/disaster-map";
import { MapPreviewSkeleton } from "@/app/dashboard/components/skeletons/map-preview-skeleton";

async function fetchDisasterPoints(): Promise<MapDisasterPointDTO[]> {
  const res = await fetch("/api/map-disasters");
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || "Gagal memuat titik peta.");
  }
  const json = await res.json();
  return json.data as MapDisasterPointDTO[];
}

export function MapTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "map"],
    queryFn: fetchDisasterPoints,
    staleTime: 1000 * 60 * 5,
  });

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length} titik di peta
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href="/arsip" target="_blank" rel="noopener noreferrer">
              <MapPin className="h-4 w-4" />
              Halaman publik
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/dashboard/maps/create">
              <Plus className="h-4 w-4" />
              Tambah titik
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <MapPreviewSkeleton />
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Pratinjau Peta</h2>
          <p className="text-xs text-muted-foreground">
            Pratinjau marker pada peta publik berdasarkan data di tabel.
          </p>
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <DisasterMap records={rows} />
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchKey="location"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
