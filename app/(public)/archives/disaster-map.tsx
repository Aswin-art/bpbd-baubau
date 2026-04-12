"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { cn } from "@/lib/utils";

const BAUBAU_CENTER = { latitude: -5.48, longitude: 122.6, zoom: 12 };

const tahunList = ["semua", "2026", "2025"];

const typeColors: Record<string, string> = {
  Banjir: "#3b82f6",
  "Tanah Longsor": "#f59e0b",
  "Angin Puting Beliung": "#8b5cf6",
  Kebakaran: "#ef4444",
  "Gelombang Tinggi": "#06b6d4",
};

type DisasterMapProps = {
  /** Jika diisi, data tidak di-fetch (untuk dashboard). */
  records?: MapDisasterPointDTO[];
  /** Klik peta untuk mengisi koordinat (dashboard). */
  pickCoordinateMode?: boolean;
  onMapClick?: (lng: number, lat: number) => void;
};

export function DisasterMap({
  records: recordsProp,
  pickCoordinateMode,
  onMapClick,
}: DisasterMapProps) {
  const [remote, setRemote] = useState<MapDisasterPointDTO[] | null>(
    recordsProp !== undefined ? recordsProp : null
  );
  const [loading, setLoading] = useState(recordsProp === undefined);

  useEffect(() => {
    if (recordsProp !== undefined) {
      setRemote(recordsProp);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/map-disasters", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setRemote(d.points ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemote([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [recordsProp]);

  const disasterRecords = remote ?? [];

  const [selectedTahun, setSelectedTahun] = useState("semua");
  const [popupInfo, setPopupInfo] = useState<MapDisasterPointDTO | null>(null);

  const filtered = useMemo(() => {
    if (selectedTahun === "semua") return disasterRecords;
    return disasterRecords.filter((r) => r.date.includes(selectedTahun));
  }, [selectedTahun, disasterRecords]);

  const handleMarkerClick = useCallback((record: MapDisasterPointDTO) => {
    setPopupInfo(record);
  }, []);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (pickCoordinateMode && onMapClick) {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      }
    },
    [pickCoordinateMode, onMapClick]
  );

  if (loading) {
    return (
      <div className="flex h-[400px] sm:h-[480px] items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        Memuat peta…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          Tahun:
        </span>
        {tahunList.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setSelectedTahun(t);
              setPopupInfo(null);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              selectedTahun === t
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {t === "semua" ? "Semua" : t}
          </button>
        ))}

        <span className="ml-auto text-[11px] text-muted-foreground">
          {filtered.length} kejadian
        </span>
      </div>

      {pickCoordinateMode && (
        <p className="text-xs text-primary font-medium">
          Klik pada peta untuk mengisi lintang &amp; bujur.
        </p>
      )}

      <div
        className={cn(
          "relative rounded-xl overflow-hidden border border-border shadow-sm h-[400px] sm:h-[480px]",
          pickCoordinateMode && "ring-2 ring-primary/30 cursor-crosshair"
        )}
      >
        <Map
          initialViewState={BAUBAU_CENTER}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          onClick={handleMapClick}
        >
          <NavigationControl position="top-right" />

          {filtered.map((record) => (
            <Marker
              key={record.id}
              latitude={record.lat}
              longitude={record.lng}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                if (!pickCoordinateMode) handleMarkerClick(record);
              }}
            >
              <div
                className="relative flex items-center justify-center cursor-pointer"
                title={record.type}
              >
                <span
                  className="absolute h-6 w-6 rounded-full opacity-30 animate-ping"
                  style={{
                    backgroundColor: typeColors[record.type] || "#6b7280",
                  }}
                />
                <span
                  className="relative h-4 w-4 rounded-full border-2 border-white shadow-md"
                  style={{
                    backgroundColor: typeColors[record.type] || "#6b7280",
                  }}
                />
              </div>
            </Marker>
          ))}
        </Map>

        <AnimatePresence>
          {popupInfo && !pickCoordinateMode && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/20 z-10"
                onClick={() => setPopupInfo(null)}
              />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="absolute left-3 top-3 bottom-3 z-20 w-72 sm:w-80"
              >
                <div className="h-full flex flex-col rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-white/60 overflow-hidden">
                  <div className="relative h-36 shrink-0">
                    <img
                      src={popupInfo.image}
                      alt={popupInfo.type}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                    <button
                      type="button"
                      onClick={() => setPopupInfo(null)}
                      className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/25 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/40"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{
                          backgroundColor:
                            typeColors[popupInfo.type] || "#6b7280",
                        }}
                      >
                        {popupInfo.type}
                      </span>
                      <span className="text-[10px] text-white/80 font-medium">
                        {popupInfo.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="text-[13px] font-bold text-foreground leading-snug">
                      {popupInfo.location}
                    </h3>
                    <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                      {popupInfo.description}
                    </p>

                    <div className="mt-auto pt-4">
                      <Link
                        href={`/archives/${popupInfo.id}`}
                        className="group flex items-center justify-between w-full rounded-lg border border-border px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
                      >
                        Lihat Detail
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground">
        {Object.entries(typeColors).map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-1">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
