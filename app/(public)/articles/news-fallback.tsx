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
        <header className="border-b-2 border-border pb-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="h-4 w-56 animate-pulse bg-muted" />
              <div className="mt-6 h-12 w-72 animate-pulse bg-muted sm:h-14 sm:w-96" />
              <div className="mt-4 h-8 w-48 animate-pulse bg-muted" />
            </div>
            <div className="h-16 w-full max-w-md animate-pulse bg-muted lg:max-w-xs" />
          </div>
        </header>

        <div className="mt-12 lg:mt-16">
          <div className="mb-10 h-6 w-56 animate-pulse bg-muted" />
          <ul className="flex flex-col gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="animate-pulse border-2 border-border p-6">
                <div className="grid gap-6 md:grid-cols-12 md:gap-8">
                  <div className="hidden md:col-span-1 md:block">
                    <div className="h-6 w-8 bg-muted" />
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden border-2 border-border bg-muted md:col-span-4 md:aspect-4/3" />
                  <div className="space-y-4 md:col-span-7">
                    <div className="flex gap-4">
                      <div className="h-5 w-24 bg-muted" />
                      <div className="h-5 w-32 bg-muted" />
                    </div>
                    <div className="h-8 w-3/4 bg-muted" />
                    <div className="h-4 w-full bg-muted" />
                    <div className="h-4 w-5/6 bg-muted" />
                    <div className="pt-4">
                      <div className="h-4 w-36 bg-muted" />
                    </div>
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
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
            BPBD Kota Baubau · Publikasi
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-secondary sm:text-5xl uppercase">
            Terjadi Gangguan Saat Memuat Berita
          </h1>

          <div className="mt-8 border-2 border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary text-primary-foreground">
                <AlertTriangle className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-black text-secondary uppercase">
                  Tidak Bisa Menampilkan Daftar Berita
                </p>
                <p className="mt-2 text-base font-medium leading-relaxed text-muted-foreground">
                  Coba lagi dalam beberapa saat atau muat ulang halaman.
                </p>
                <p className="mt-4 border-l-2 border-primary pl-4 font-mono text-xs font-bold text-muted-foreground">
                  {message}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button
                    type="button"
                    onClick={resetErrorBoundary}
                    className="rounded-none border-2 border-secondary bg-secondary px-6 py-6 font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground hover:bg-secondary/90"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    Coba Lagi
                  </Button>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center border-2 border-border bg-card px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    Kembali ke Beranda
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
