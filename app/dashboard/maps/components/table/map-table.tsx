"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { columns } from "./columns";
import { DisasterMap } from "@/app/(public)/archives/disaster-map";
import { MapPreviewSkeleton } from "@/app/dashboard/components/skeletons/map-preview-skeleton";
import { useState } from "react";
import { DeleteDialog } from "../dialogs/delete-dialog";

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
  const [q] = useQueryState("q", parseAsString.withDefault(""));

  const rows = data ?? [];
  const normalizedQuery = q.trim().toLowerCase();
  const visibleRows = normalizedQuery
    ? rows.filter((row) => row.location.toLowerCase().includes(normalizedQuery))
    : rows;
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedIds = Object.keys(rowSelection)
    .map((index) => visibleRows[parseInt(index)]?.id)
    .filter(Boolean);

  const selectedItemName =
    selectedIds.length === 1
      ? visibleRows.find((r) => r.id === selectedIds[0])?.location
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {normalizedQuery
            ? `${visibleRows.length} dari ${rows.length} titik di peta`
            : `${rows.length} titik di peta`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href="/archives" target="_blank" rel="noopener noreferrer">
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
            <DisasterMap records={visibleRows} />
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          {Object.keys(rowSelection).length > 0 && (
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
              <span className="text-sm text-muted-foreground">
                {Object.keys(rowSelection).length} titik dipilih
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          )}
          <DataTable
            columns={columns}
            data={visibleRows}
            searchKey="location"
            isLoading={isLoading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        </>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ids={selectedIds}
        itemName={selectedItemName}
        onSuccess={() => setRowSelection({})}
      />
    </div>
  );
}
