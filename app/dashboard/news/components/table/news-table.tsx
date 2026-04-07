"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/datatable/table-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/app/dashboard/components/skeletons/table-skeleton";
import { newsArticles, type NewsArticle } from "@/data/dummy-data";
import { columns } from "./columns";

async function fetchNews(): Promise<NewsArticle[]> {
  await new Promise((r) => setTimeout(r, 600));
  return newsArticles;
}

export function NewsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "news"],
    queryFn: fetchNews,
  });

  if (isLoading) return <TableSkeleton />;

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} artikel</p>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/dashboard/news/create">
            <Plus className="h-4 w-4" />
            Tulis berita
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchKey="title"
        isLoading={isLoading}
      />
    </div>
  );
}
