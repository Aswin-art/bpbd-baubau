"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MapPreviewSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-72" />
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <Skeleton className="h-[360px] w-full rounded-lg" />
      </div>
    </div>
  );
}

