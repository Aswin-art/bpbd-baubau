"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Badge } from "@/components/ui/badge";
import Wrapper from "@/components/wrapper";
import type { Aspiration } from "@/data/dummy-data";
import { aspirationStatusLabels } from "@/data/dummy-data";
import { AspirasiForm } from "./aspirasi-form";
import { AspirationsErrorFallback, AspirationsSkeleton } from "./aspirations-fallback";

type AspirationsApiResponse = {
  items: Aspiration[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  status?: string;
  q?: string;
};

async function fetchAspirations(params: {
  page: number;
  status: string;
  q: string;
}): Promise<AspirationsApiResponse> {
  const qs = new URLSearchParams();
  if (params.page > 1) qs.set("hal", String(params.page));
  if (params.status && params.status !== "semua") qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  const res = await fetch(`/api/aspirations?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat aspirasi.");
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AspirationsClient() {
  return (
    <ErrorBoundary FallbackComponent={AspirationsErrorFallback}>
      <Suspense fallback={<AspirationsSkeleton />}>
        <AspirationsClientInner />
      </Suspense>
    </ErrorBoundary>
  );
}

function AspirationsClientInner() {
  const [page, setPage] = useQueryState("hal", parseAsInteger.withDefault(1));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("semua"));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [qInput, setQInput] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = qInput.trim();
      void setQ(next ? next : null);
      void setPage(null);
    }, 350);
    return () => clearTimeout(t);
  }, [qInput, setQ, setPage]);

  useEffect(() => {
    setQInput(q);
  }, [q]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["public-aspirations", page, status, q],
    queryFn: () => fetchAspirations({ page, status, q }),
  });

  const totalPages = data?.totalPages ?? 1;
  const current = data?.page ?? page;
  const items = data?.items ?? [];

  const statusOptions = useMemo(() => {
    return [
      { value: "semua", label: "Semua" },
      { value: "pending", label: aspirationStatusLabels.pending },
      { value: "in_progress", label: aspirationStatusLabels.in_progress },
      { value: "completed", label: aspirationStatusLabels.completed },
      { value: "rejected", label: aspirationStatusLabels.rejected },
    ];
  }, []);

  const setStatusAndReset = (next: string) => {
    void setStatus(next === "semua" ? null : next);
    void setPage(null);
  };

  const goTo = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    void setPage(next === 1 ? null : next);
  };

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <header>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              BPBD Kota Baubau · Layanan
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
              Aspirasi
              <span className="mt-1 block text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                masyarakat
              </span>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:max-w-xs lg:text-right">
            Sampaikan laporan atau masukan terkait kebencanaan. Setiap aspirasi
            akan ditindaklanjuti oleh tim BPBD.
          </p>
        </div>
      </header>

      <div className="mt-12 lg:mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start">
        {/* Form (fokus utama) */}
        <section aria-labelledby="aspirasi-form-heading" className="order-1">
          <div className="rounded-3xl border border-border/60 bg-background">
            <div className="border-b border-border/60 px-6 py-5 sm:px-7">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Layanan aspirasi
              </p>
              <h2
                id="aspirasi-form-heading"
                className="mt-2 text-xl font-semibold tracking-tight text-secondary sm:text-2xl"
              >
                Kirim aspirasi Anda
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ceritakan situasi secara ringkas dan jelas. Jika ada foto pendukung,
                unggah secara opsional.
              </p>
            </div>
            <div className="px-6 py-6 sm:px-7 sm:py-7">
              <AspirasiForm />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Estimasi
              </p>
              <p className="mt-2 text-sm font-semibold text-secondary">3×24 jam kerja</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Waktu tindak lanjut dapat berubah sesuai antrean & verifikasi.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Privasi
              </p>
              <p className="mt-2 text-sm font-semibold text-secondary">Data pelapor aman</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Informasi pelapor dijaga kerahasiaannya.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Tips
              </p>
              <p className="mt-2 text-sm font-semibold text-secondary">Detail seperlunya</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sertakan lokasi, waktu, dan kronologi singkat.
              </p>
            </div>
          </div>
        </section>

        {/* Riwayat (pendamping) */}
        <aside className="order-2 lg:sticky lg:top-32">
          <div className="rounded-3xl border border-border/60 bg-background">
            <div className="border-b border-border/60 px-6 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Riwayat
                  </p>
                  <h2
                    id="aspirasi-history-heading"
                    className="mt-2 text-lg font-semibold text-secondary"
                  >
                    Aspirasi terkirim
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {data ? `${data.total} entri` : "Memuat…"}
                </p>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {statusOptions.map((opt) => {
                    const active = (status || "semua") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatusAndReset(opt.value)}
                        className={
                          active
                            ? "rounded-full bg-secondary px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-foreground"
                            : "rounded-full border border-border/60 bg-background px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-secondary"
                        }
                        aria-pressed={active}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3.5 py-2">
                  <input
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder="Cari…"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    aria-label="Cari aspirasi"
                  />
                  {qInput.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQInput("");
                        void setQ(null);
                        void setPage(null);
                      }}
                      className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
                    >
                      hapus
                    </button>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">
                  {totalPages > 1 ? (
                    <span className="text-muted-foreground/70">
                      halaman {String(current)} dari {String(totalPages)}
                    </span>
                  ) : null}
                  {isFetching && !isLoading ? (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      memuat
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            {isError ? (
              (() => {
                throw new Error("Gagal memuat aspirasi.");
              })()
            ) : isLoading ? (
              <AspirationsSkeleton />
            ) : items.length === 0 ? (
              <div className="rounded-2xl bg-muted/40 px-6 py-16 text-center">
                <p className="text-base font-semibold tracking-tight text-secondary">
                  Tidak ada entri
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tidak ada hasil untuk filter/pencarian ini.
                </p>
              </div>
            ) : (
              <ul className="border-t border-border/70">
                {items.map((item, i) => {
                  const idx = (current - 1) * (data?.perPage ?? 6) + i + 1;
                  const statusLabel =
                    aspirationStatusLabels[item.status] ?? item.status;
                  const imageUrl = undefined;
                  return (
                    <li key={item.id} className="border-b border-border/70 px-6 py-6">
                      <div className="grid gap-4">
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                          {String(idx).padStart(2, "0")}
                        </span>
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <Badge
                              variant="outline"
                              className="border-0 bg-muted text-secondary text-[10px] font-semibold uppercase tracking-wider"
                            >
                              {statusLabel}
                            </Badge>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              {formatDate(item.createdAt)}
                            </span>
                            <span className="text-muted-foreground/60">·</span>
                            <span className="text-xs text-muted-foreground">{item.submitterName}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {totalPages > 1 ? (
              <nav className="px-6 py-6 flex flex-wrap items-center justify-end gap-3 sm:gap-4" aria-label="Paginasi aspirasi">
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  disabled={current <= 1}
                  className={
                    current > 1
                      ? "inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
                      : "inline-flex items-center gap-2 text-sm text-muted-foreground/50"
                  }
                >
                  Sebelumnya
                </button>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goTo(p)}
                      className={
                        p === current
                          ? "flex min-h-9 min-w-9 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground"
                          : "flex min-h-9 min-w-9 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      }
                      aria-current={p === current ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  disabled={current >= totalPages}
                  className={
                    current < totalPages
                      ? "inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
                      : "inline-flex items-center gap-2 text-sm text-muted-foreground/50"
                  }
                >
                  Selanjutnya
                </button>
              </nav>
            ) : null}
          </div>
        </aside>
      </div>
    </Wrapper>
  );
}

