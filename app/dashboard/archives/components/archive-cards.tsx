"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Archive, CalendarRange, FileText, Layers } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ArchiveStats = {
  total: number;
  years: number;
  latestYear: string | null;
  latestYearCount: number;
};

async function fetchStats(): Promise<ArchiveStats> {
  const res = await fetch("/api/dashboard/archives/stats");
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || "Gagal memuat statistik arsip.");
  }
  const json = await res.json();
  return json.data;
}

export function ArchiveCards() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ["archives", "stats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total arsip</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Jumlah dokumen arsip bencana.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tahun tersedia</CardTitle>
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.years}</div>
          <p className="text-xs text-muted-foreground">
            Banyaknya tahun yang memiliki arsip.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tahun terbaru</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.latestYear ?? "-"}</div>
          <p className="text-xs text-muted-foreground">
            Tahun arsip paling baru.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Arsip tahun terbaru</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.latestYearCount}</div>
          <p className="text-xs text-muted-foreground">
            Dokumen pada tahun terbaru.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

