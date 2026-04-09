"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FileText, Gavel, ListChecks, NotebookPen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DocumentStats = {
  total: number;
  sop: number;
  regulasi: number;
  pedoman: number;
};

async function fetchStats(): Promise<DocumentStats> {
  const res = await fetch("/api/dashboard/documents/stats");
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || "Gagal memuat statistik dokumen.");
  }
  const json = await res.json();
  return json.data;
}

export function DocumentCards() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ["documents", "stats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total dokumen</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Jumlah dokumen untuk unduhan publik.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SOP</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sop}</div>
          <p className="text-xs text-muted-foreground">Dokumen SOP.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regulasi</CardTitle>
          <Gavel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.regulasi}</div>
          <p className="text-xs text-muted-foreground">Dokumen regulasi.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedoman</CardTitle>
          <NotebookPen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pedoman}</div>
          <p className="text-xs text-muted-foreground">Dokumen pedoman.</p>
        </CardContent>
      </Card>
    </div>
  );
}

