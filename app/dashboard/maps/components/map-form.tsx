"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { SearchSelect } from "@/components/ui/search-select";
import { DatePicker } from "@/components/ui/date-picker";
import FileUpload from "@/components/file-upload";
import { createMultipleUploadHandler, useMultipleUpload } from "@/modules/upload";
import { PG_INT32_MAX } from "@/lib/pg-int32";
import {
  DEFAULT_MAP_TYPE_COLORS,
  getDefaultMapTypeColor,
  normalizeMapColor,
} from "@/lib/map-disaster-colors";

const BAUBAU_CENTER = { latitude: -5.48, longitude: 122.6, zoom: 12 };

/** Unwrap `{ status, data }` from apiSuccess or use a raw array. */
function unwrapApiList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return (raw as { data: unknown[] }).data;
  }
  return [];
}

interface MapFormProps {
  initialData?: MapDisasterPointDTO;
}

type MapCategoryOption = {
  id: string;
  label: string;
  color: string;
};

async function fetchMapCategories(): Promise<MapCategoryOption[]> {
  const res = await fetch("/api/dashboard/maps/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat kategori map bencana.");
  const json = await res.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  return items
    .map((item) => ({
      id: String(item?.id || "").trim(),
      label: String(item?.label || item?.id || "").trim(),
      color: normalizeMapColor(item?.color) ?? "#6b7280",
    }))
    .filter((item) => item.id && item.label);
}

export function MapForm({ initialData }: MapFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    type: initialData?.type ?? "Banjir",
    typeColor:
      normalizeMapColor(initialData?.typeColor) ??
      getDefaultMapTypeColor(initialData?.type ?? "Banjir"),
    location: initialData?.location ?? "",
    kecamatan: initialData?.kecamatan ?? "",
    date: initialData?.date ?? "",
    description: initialData?.description ?? "",
    image: initialData?.image ?? "https://picsum.photos/seed/map-new/400/200",
    lat: initialData?.lat ?? -5.48,
    lng: initialData?.lng ?? 122.6,
    casualties: initialData?.casualties ?? 0,
    displaced: initialData?.displaced ?? 0,
  });

  const [images, setImages] = useState<string[]>(
    initialData?.image ? [initialData.image] : [],
  );

  const uploadMutation = useMultipleUpload({ scope: "maps" });
  const onUpload = createMultipleUploadHandler(uploadMutation);
  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["dashboard", "map-categories"],
    queryFn: fetchMapCategories,
    staleTime: 1000 * 60 * 5,
  });
  const colorPresets = useMemo(
    () => Array.from(new Set(Object.values(DEFAULT_MAP_TYPE_COLORS))),
    [],
  );

  /**
   * Hanya digit; nol di depan dibuang (0123 → 123). Dipakai dengan input teks + value String(n)
   * supaya tampilan tidak bisa “nempel” seperti di type="number".
   */
  function parseCountField(raw: string): number {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") return 0;
    const trimmed = digits.replace(/^0+/, "") || "0";
    const n = parseInt(trimmed, 10);
    if (!Number.isFinite(n)) return 0;
    return Math.min(Math.max(0, n), PG_INT32_MAX);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const target = e.target;
    const { name, value } = target;
    const type = (target as HTMLInputElement).type;

    if (type === "number") {
      if (name === "lat" || name === "lng") {
        const n = parseFloat(String(value).replace(/,/g, "."));
        setForm((prev) => ({
          ...prev,
          [name]: Number.isFinite(n) ? n : 0,
        }));
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const selectedDate = useMemo(() => {
    if (!form.date) return undefined;
    if (Number.isNaN(Date.parse(form.date))) return undefined;
    return new Date(form.date);
  }, [form.date]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        typeColor: normalizeMapColor(form.typeColor) ?? getDefaultMapTypeColor(form.type),
        // keep legacy `image` field filled for existing UI
        image: images[0] || form.image || "",
        images,
      };

      const res = await fetch(
        isEdit ? `/api/map-disasters/${initialData!.id}` : "/api/map-disasters",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menyimpan titik bencana.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "map"] });
      toast.success(
        isEdit
          ? "Titik bencana berhasil diperbarui."
          : "Titik bencana berhasil dibuat.",
      );
      router.push("/dashboard/maps");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Edit Titik Bencana" : "Tambah Titik Baru"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Perbarui informasi titik kejadian bencana."
            : "Isi form di bawah untuk menambahkan titik bencana baru ke peta."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label>
              Lokasi pin (drag untuk ubah) <span className="text-destructive">*</span>
            </Label>
            <div className="rounded-xl border border-border shadow-sm overflow-hidden h-[320px] sm:h-[420px]">
              <Map
                initialViewState={{
                  latitude: form.lat ?? BAUBAU_CENTER.latitude,
                  longitude: form.lng ?? BAUBAU_CENTER.longitude,
                  zoom: BAUBAU_CENTER.zoom,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                onClick={(e) => {
                  setForm((f) => ({ ...f, lng: e.lngLat.lng, lat: e.lngLat.lat }));
                }}
              >
                <NavigationControl position="top-right" />
                <Marker
                  longitude={form.lng}
                  latitude={form.lat}
                  anchor="center"
                  draggable
                  onDragEnd={(e) => {
                    setForm((f) => ({
                      ...f,
                      lng: e.lngLat.lng,
                      lat: e.lngLat.lat,
                    }));
                  }}
                >
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: form.typeColor }}
                  />
                </Marker>
              </Map>
            </div>
            <p className="text-xs text-muted-foreground">
              Kamu bisa klik peta atau drag pin untuk menentukan koordinat.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Jenis Bencana <span className="text-destructive">*</span>
            </Label>
            <SearchSelect<MapCategoryOption>
              apiEndpoint="/api/dashboard/maps/categories"
              placeholder="Pilih / ketik jenis lain jika tidak ada di daftar"
              value={form.type || null}
              initialOption={{
                id: form.type,
                label: form.type,
                color: form.typeColor,
              }}
              onChange={(v) =>
                setForm((f) => {
                  const nextType = v || "Banjir";
                  const matched = categoryOptions.find((option) => option.id === nextType);
                  return {
                    ...f,
                    type: nextType,
                    typeColor:
                      matched?.color ?? f.typeColor ?? getDefaultMapTypeColor(nextType),
                  };
                })
              }
              creatable
              responseMapper={(data) =>
                unwrapApiList(data)
                  .map((item) => ({
                    id: String((item as { id?: unknown }).id || "").trim(),
                    label: String(
                      (item as { label?: unknown; id?: unknown }).label ||
                        (item as { id?: unknown }).id ||
                        "",
                    ).trim(),
                    color:
                      normalizeMapColor((item as { color?: unknown }).color) ?? "#6b7280",
                  }))
                  .filter((item) => item.id && item.label)
              }
              renderOption={(option) => (
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-border/60"
                    style={{ backgroundColor: option.color || "#6b7280" }}
                  />
                  <span>{option.label}</span>
                </div>
              )}
              renderValue={(option) => (
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-border/60"
                    style={{ backgroundColor: option.color || form.typeColor }}
                  />
                  <span>{option.label}</span>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeColor">
              Warna Kategori <span className="text-destructive">*</span>
            </Label>
            <ColorPicker
              value={form.typeColor}
              presets={colorPresets}
              onChange={(value) =>
                setForm((f) => ({
                  ...f,
                  typeColor: normalizeMapColor(value) ?? f.typeColor,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Warna ini dipakai untuk badge dan marker kategori "{form.type}".
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Lokasi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Jl. ... / Kel. ..."
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kecamatan">
                Kecamatan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kecamatan"
                name="kecamatan"
                value={form.kecamatan}
                onChange={handleChange}
                placeholder="Nama kecamatan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={selectedDate}
                setDate={(d) => {
                  setForm((f) => ({ ...f, date: d ? format(d, "yyyy-MM-dd") : "" }));
                }}
                placeholder="Pilih tanggal"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lat">
                Lintang <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lat"
                name="lat"
                type="number"
                step="any"
                value={form.lat}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">
                Bujur <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lng"
                name="lng"
                type="number"
                step="any"
                value={form.lng}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Foto bencana</Label>
            <FileUpload
              multiple
              value={images}
              onChange={(v) => setImages(v)}
              onUpload={async (file) => {
                // single file handler for FileUpload's multiple mode
                const url = await onUpload(file);
                return url;
              }}
              accept={{
                "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
              }}
              disabled={saveMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Upload banyak foto. Masing-masing akan tampil pratinjau.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Kronologis singkat kejadian"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="casualties">Korban Jiwa</Label>
              <Input
                id="casualties"
                name="casualties"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="tabular-nums"
                value={String(form.casualties)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    casualties: parseCountField(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displaced">Mengungsi</Label>
              <Input
                id="displaced"
                name="displaced"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="tabular-nums"
                value={String(form.displaced)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    displaced: parseCountField(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                "Menyimpan..."
              ) : isEdit ? (
                "Simpan"
              ) : (
                "Tambah Titik"
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/maps">Batal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
