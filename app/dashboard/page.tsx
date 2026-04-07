"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Users,
  FileText,
  MessageSquareText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Flame,
  CloudRain,
  Wind,
  Waves,
  Mountain,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardHeader } from "./dashboard-header";
import {
  newsArticles,
  aspirations,
  aspirationStatusLabels,
  documents,
} from "@/data/dummy-data";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";

const disasterTypeIcons: Record<string, typeof Flame> = {
  Banjir: CloudRain,
  "Tanah Longsor": Mountain,
  "Angin Puting Beliung": Wind,
  Kebakaran: Flame,
  "Gelombang Tinggi": Waves,
};

const aspirasiStatusConfig = {
  pending: {
    label: "Menunggu",
    icon: Clock,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  in_progress: {
    label: "Diproses",
    icon: Loader2,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  completed: {
    label: "Selesai",
    icon: CheckCircle2,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

function getDisasterTypeCounts(records: MapDisasterPointDTO[]) {
  if (records.length === 0) return [];
  const counts: Record<string, number> = {};
  records.forEach((r) => {
    counts[r.type] = (counts[r.type] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      count,
      pct: Math.round((count / records.length) * 100),
    }));
}

function getAspirasiStatusCounts() {
  const counts = { pending: 0, in_progress: 0, completed: 0, rejected: 0 };
  aspirations.forEach((a) => {
    counts[a.status]++;
  });
  return counts;
}

export default function DashboardPage() {
  const [mapPoints, setMapPoints] = useState<MapDisasterPointDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/map-disasters")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMapPoints(d.points ?? []);
      })
      .catch(() => {
        if (!cancelled) setMapPoints([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const typeCounts = useMemo(
    () => getDisasterTypeCounts(mapPoints),
    [mapPoints]
  );
  const aspirasiCounts = getAspirasiStatusCounts();
  const recentDisasters = mapPoints.slice(0, 5);
  const recentNews = newsArticles.slice(0, 4);
  const totalAspirations = aspirations.length;

  const totalMengungsi = useMemo(
    () => mapPoints.reduce((s, r) => s + r.displaced, 0),
    [mapPoints]
  );

  const statsCards = useMemo(
    () => [
      {
        label: "Titik peta (map)",
        value: String(mapPoints.length),
        change: "+2",
        trend: "up" as const,
        period: "vs. bulan lalu",
        icon: AlertTriangle,
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        label: "Warga Mengungsi (peta)",
        value: String(totalMengungsi),
        change: "-12%",
        trend: "down" as const,
        period: "vs. bulan lalu",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Dokumen Aktif",
        value: String(documents.length),
        change: "+1",
        trend: "up" as const,
        period: "dokumen baru",
        icon: FileText,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Aspirasi Masuk",
        value: String(aspirations.length),
        change: "3",
        trend: "up" as const,
        period: "belum diproses",
        icon: MessageSquareText,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ],
    [mapPoints.length, totalMengungsi]
  );

  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Ringkasan data kebencanaan dan layanan BPBD Kota Baubau."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-emerald-600" />
                    )}
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {stat.change}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {stat.period}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column — 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Disaster type breakdown */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold">
                  Jenis Bencana
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-muted/50"
                >
                  Tahun 2025–2026
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeCounts.map((item) => {
                const Icon = disasterTypeIcons[item.type] || AlertTriangle;
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground tabular-nums">
                          {item.count}
                        </span>
                        <span className="text-[11px] text-muted-foreground w-10 text-right tabular-nums">
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                    <Progress value={item.pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent disasters table */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold">
                  Kejadian Terkini
                </CardTitle>
                <Link href="/dashboard/archives">
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                    Lihat semua
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDisasters.map((disaster) => {
                  const Icon =
                    disasterTypeIcons[disaster.type] || AlertTriangle;
                  return (
                    <Link
                      key={disaster.id}
                      href={`/arsip/${disaster.id}`}
                      className="flex items-center gap-4 rounded-xl border border-border/60 p-3.5 transition-all hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm group"
                    >
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={disaster.image}
                          alt={disaster.type}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-sm font-semibold text-foreground truncate">
                            {disaster.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{disaster.location}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-muted-foreground">
                          {disaster.date}
                        </p>
                        {disaster.displaced > 0 && (
                          <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                            {disaster.displaced} mengungsi
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">
          {/* Aspirasi Status */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-[15px] font-bold">
                Status Aspirasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Donut-like visual */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {(() => {
                      const data = [
                        { status: "completed", color: "#22c55e" },
                        { status: "in_progress", color: "#3b82f6" },
                        { status: "pending", color: "#eab308" },
                        { status: "rejected", color: "#ef4444" },
                      ];
                      let cumulative = 0;
                      const circumference = Math.PI * 80;
                      return data.map((d) => {
                        const count =
                          aspirasiCounts[
                            d.status as keyof typeof aspirasiCounts
                          ];
                        const pct = count / totalAspirations;
                        const dashLength = pct * circumference;
                        const dashOffset = cumulative * circumference;
                        cumulative += pct;
                        return (
                          <circle
                            key={d.status}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={d.color}
                            strokeWidth="10"
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={-dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">
                      {totalAspirations}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Total
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.entries(aspirasiStatusConfig) as [
                    keyof typeof aspirasiStatusConfig,
                    (typeof aspirasiStatusConfig)[keyof typeof aspirasiStatusConfig],
                  ][]
                ).map(([key, config]) => {
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 rounded-lg border ${config.border} ${config.bg} px-3 py-2`}
                    >
                      <StatusIcon
                        className={`h-3.5 w-3.5 ${config.color} ${key === "in_progress" ? "animate-spin" : ""}`}
                      />
                      <div>
                        <p
                          className={`text-[11px] font-semibold ${config.color}`}
                        >
                          {aspirasiCounts[key]}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {config.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent News */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold">
                  Berita Terbaru
                </CardTitle>
                <Link href="/dashboard/news">
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                    Semua
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNews.map((news) => (
                <Link
                  key={news.slug}
                  href={`/berita/${news.slug}`}
                  className="flex gap-3 group"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={news.imageUrl}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {news.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {news.dateLabel}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Aspirations */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold">
                  Aspirasi Terbaru
                </CardTitle>
                <Link href="/dashboard/aspirations">
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                    Semua
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {aspirations.slice(0, 4).map((item) => {
                const config = aspirasiStatusConfig[item.status];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                  >
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                        {item.submitterName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-foreground truncate">
                          {item.submitterName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-semibold border-0 ${config.bg} ${config.color} shrink-0`}
                        >
                          <StatusIcon
                            className={`h-2.5 w-2.5 mr-1 ${item.status === "in_progress" ? "animate-spin" : ""}`}
                          />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground line-clamp-1">
                        {item.description.text}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
