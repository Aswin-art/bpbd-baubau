"use client";

import Link from "next/link";
import type { FallbackProps } from "react-error-boundary";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";

export function ArchiveDetailSkeleton() {
  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <div className="h-4 w-40 animate-pulse rounded bg-muted mb-8" />
      <div className="relative rounded-2xl overflow-hidden mb-10">
        <div className="aspect-21/9 sm:aspect-3/1 animate-pulse bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div className="flex gap-5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-24 w-full max-w-md animate-pulse rounded-xl bg-muted" />
          <div className="space-y-3">
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-4/3 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </Wrapper>
  );
}

export function ArchiveDetailErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <div className="max-w-2xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          BPBD Kota Baubau · Arsip Bencana
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-secondary sm:text-4xl">
          Terjadi gangguan saat memuat arsip
        </h1>

        <div className="mt-8 rounded-2xl border border-border/60 bg-background p-6">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-secondary">
                Tidak bisa menampilkan detail titik bencana.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Coba lagi dalam beberapa saat atau kembali ke daftar arsip.
              </p>
              {message ? (
                <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                  {message}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={resetErrorBoundary}
                  className="rounded-md bg-secondary font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-foreground hover:bg-secondary/90"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Coba lagi
                </Button>
                <Link
                  href="/archives"
                  className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-muted/30"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Arsip
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
