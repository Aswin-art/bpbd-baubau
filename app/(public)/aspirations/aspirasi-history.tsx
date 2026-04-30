"use client";

import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

type AspirationStatus = "pending" | "in_progress" | "completed" | "rejected";

type AspirationHistoryItem = {
  id: string;
  submitterName: string;
  description: string;
  status: AspirationStatus;
  createdAt: string;
};

type AspirationsApiResponse = {
  requiresAuth?: boolean;
  items: AspirationHistoryItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

const statusConfig: Record<
  AspirationStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Menunggu",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-0",
  },
  in_progress: {
    label: "Diproses",
    icon: Loader2,
    className: "bg-blue-100 text-blue-800 border-0",
  },
  completed: {
    label: "Selesai",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-0",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-0",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function fetchAspirations(): Promise<AspirationsApiResponse> {
  const res = await fetch("/api/public/aspirations", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat riwayat aspirasi.");
  return res.json();
}

export function AspirasiHistory() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-aspiration-history"],
    queryFn: fetchAspirations,
  });

  if (isLoading) {
    return (
      <section className="mt-12 pt-10 border-t border-border">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Riwayat Aspirasi</h2>
          <p className="text-sm text-muted-foreground mt-1">Memuat…</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mt-12 pt-10 border-t border-border">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Riwayat Aspirasi</h2>
          <p className="text-sm text-destructive mt-1">
            Gagal memuat riwayat. Silakan coba lagi.
          </p>
        </div>
      </section>
    );
  }

  if (data?.requiresAuth) {
    return (
      <section className="mt-12 pt-10 border-t border-border">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Riwayat Aspirasi</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Masuk untuk melihat riwayat aspirasi yang pernah Anda kirim.
          </p>
          <a
            href="/sign-in"
            className="mt-4 inline-flex rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"
          >
            Masuk
          </a>
        </div>
      </section>
    );
  }

  const items = data?.items ?? [];

  return (
    <section className="mt-12 pt-10 border-t border-border">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">
          Riwayat Aspirasi
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar aspirasi yang pernah dikirim beserta status tindak lanjutnya.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const status = statusConfig[item.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-border/80 hover:shadow-sm"
            >
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    item.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : item.status === "in_progress"
                        ? "bg-blue-100 text-blue-600"
                        : item.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <StatusIcon className={`h-4 w-4 ${item.status === "in_progress" ? "animate-spin" : ""}`} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground">
                    {item.id}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-wider ${status.className}`}
                  >
                    {status.label}
                  </Badge>
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Pelapor: {item.submitterName}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
