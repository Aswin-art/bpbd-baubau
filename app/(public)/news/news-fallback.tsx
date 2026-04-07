"use client";

import Link from "next/link";
import type { FallbackProps } from "react-error-boundary";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";

export function NewsSkeleton() {
  return (
    <Wrapper>
      <div className="min-h-screen bg-background pt-24 pb-16 md:pt-28 xl:pt-32">
        <header>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              <div className="mt-6 h-10 w-72 animate-pulse rounded bg-muted sm:h-12 sm:w-96" />
              <div className="mt-3 h-6 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-16 w-full max-w-md animate-pulse rounded bg-muted lg:max-w-xs" />
          </div>
        </header>

        <div className="mt-12 lg:mt-16">
          <div className="mb-10 h-5 w-56 animate-pulse rounded bg-muted" />
          <ul className="flex flex-col gap-8 lg:gap-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="animate-pulse">
                <div className="grid gap-6 md:grid-cols-12 md:gap-8">
                  <div className="h-4 w-10 rounded bg-muted md:col-span-1" />
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted md:col-span-3 md:aspect-4/3" />
                  <div className="space-y-3 md:col-span-8">
                    <div className="h-3 w-44 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-5/6 rounded bg-muted" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Wrapper>
  );
}

export function NewsErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return (
    <Wrapper>
      <div className="min-h-screen bg-background pt-24 pb-16 md:pt-28 xl:pt-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            BPBD Kota Baubau · Publikasi
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-secondary sm:text-4xl">
            Terjadi gangguan saat memuat berita
          </h1>

          <div className="mt-8 rounded-2xl border border-border/60 bg-background p-6">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary">
                  Tidak bisa menampilkan daftar berita.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Coba lagi dalam beberapa saat atau muat ulang halaman.
                </p>
                <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                  {message}
                </p>

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
                    href="/"
                    className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-muted/30"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke beranda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

