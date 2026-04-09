"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FileText, Gavel, ListChecks, NotebookPen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DocumentStats = {
  total: number;
  byCategory: Record<string, number>;
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

  const topCategories = Object.entries(stats.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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

      {[0, 1, 2].map((idx) => {
        const entry = topCategories[idx];
        const title = entry?.[0] ?? "-";
        const count = entry?.[1] ?? 0;
        const Icon = idx === 0 ? ListChecks : idx === 1 ? Gavel : NotebookPen;

        return (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">Dokumen kategori.</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

