import { Newspaper, Eye, FileEdit, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ArticleStats } from "@/modules/articles";

async function fetchStats(): Promise<ArticleStats> {
  const res = await fetch("/api/dashboard/articles/stats");
  if (!res.ok) {
    throw new Error("Gagal memuat statistik.");
  }
  const json = await res.json();
  return json.data;
}

export function ArticleCards() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ["articles", "stats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total artikel
          </CardTitle>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Jumlah seluruh artikel yang tersimpan.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Dipublikasikan
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.published}</div>
          <p className="text-xs text-muted-foreground">
            Artikel yang terlihat di portal publik.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Draf
          </CardTitle>
          <FileEdit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.draft}</div>
          <p className="text-xs text-muted-foreground">
            Artikel yang belum dipublikasikan.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Diarsipkan
          </CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.archived}</div>
          <p className="text-xs text-muted-foreground">
            Artikel yang disembunyikan dari portal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
