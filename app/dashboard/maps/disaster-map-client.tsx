"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardHeader } from "../components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisasterMap } from "@/app/(public)/archives/disaster-map";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import type { MapDisasterCreateInput } from "@/lib/map-disaster-zod";
import { DataTable } from "@/components/datatable/table-data";

const TYPE_OPTIONS = [
  "Banjir",
  "Tanah Longsor",
  "Angin Puting Beliung",
  "Kebakaran",
  "Gelombang Tinggi",
];

function emptyForm(): MapDisasterCreateInput {
  return {
    type: "Banjir",
    location: "",
    kecamatan: "",
    date: "",
    description: "",
    image: "https://picsum.photos/seed/map-new/400/200",
    lat: -5.48,
    lng: 122.6,
    casualties: 0,
    displaced: 0,
  };
}

export function DisasterMapClient() {
  const [points, setPoints] = useState<MapDisasterPointDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MapDisasterCreateInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MapDisasterPointDTO | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/map-disasters");
    const data = await res.json();
    setPoints(data.points ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((row: MapDisasterPointDTO) => {
    setEditingId(row.id);
    setForm({
      type: row.type,
      location: row.location,
      kecamatan: row.kecamatan,
      date: row.date,
      description: row.description,
      image: row.image,
      lat: row.lat,
      lng: row.lng,
      casualties: row.casualties,
      displaced: row.displaced,
    });
    setSheetOpen(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/map-disasters/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(typeof err.error === "string" ? err.error : "Gagal menyimpan");
          return;
        }
      } else {
        const res = await fetch("/api/map-disasters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(typeof err.error === "string" ? err.error : "Gagal menambah");
          return;
        }
      }
      setSheetOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/map-disasters/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Gagal menghapus");
        return;
      }
      setDeleteTarget(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<MapDisasterPointDTO, unknown>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Jenis",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[220px] line-clamp-2">
            {row.original.location}
          </span>
        ),
      },
      {
        accessorKey: "kecamatan",
        header: "Kecamatan",
      },
      {
        accessorKey: "date",
        header: "Tanggal",
      },
      {
        accessorKey: "lat",
        header: "Koordinat",
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {row.original.lat.toFixed(4)}, {row.original.lng.toFixed(4)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openEdit]
  );

  const updateField = <K extends keyof MapDisasterCreateInput>(
    key: K,
    value: MapDisasterCreateInput[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <>
      <DashboardHeader
        title="Map Bencana"
        description="Kelola titik kejadian di peta (CRUD). Data ini tidak sama dengan arsip laporan tahunan."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? "Memuat…" : `${points.length} titik di peta`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href="/arsip" target="_blank" rel="noopener noreferrer">
              <MapPin className="h-4 w-4" />
              Halaman publik
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah titik
          </Button>
        </div>
      </div>

      {!loading && <DataTable columns={columns} data={points} />}

      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Pratinjau peta</h2>
        <p className="text-xs text-muted-foreground">
          Filter tahun memengaruhi tampilan marker; data tetap sama dengan tabel
          di atas.
        </p>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <DisasterMap records={points} />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Ubah titik" : "Titik baru"}
            </SheetTitle>
            <SheetDescription>
              Isi data kejadian. Koordinat lintang/bujur bisa disalin dari peta
              pratinjau di bawah.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={form.type}
                onValueChange={(v) => updateField("type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Lokasi</Label>
              <Input
                id="loc"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kec">Kecamatan</Label>
              <Input
                id="kec"
                value={form.kecamatan}
                onChange={(e) => updateField("kecamatan", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal (teks)</Label>
              <Input
                id="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                placeholder="contoh: 1 April 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lat">Lintang</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) =>
                    updateField("lat", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Bujur</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) =>
                    updateField("lng", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">URL gambar</Label>
              <Input
                id="img"
                value={form.image}
                onChange={(e) => updateField("image", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Deskripsi</Label>
              <Textarea
                id="desc"
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cas">Korban jiwa</Label>
                <Input
                  id="cas"
                  type="number"
                  min={0}
                  value={form.casualties}
                  onChange={(e) =>
                    updateField("casualties", parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dis">Mengungsi</Label>
                <Input
                  id="dis"
                  type="number"
                  min={0}
                  value={form.displaced}
                  onChange={(e) =>
                    updateField("displaced", parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>
            </div>
          </div>
          <SheetFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSheetOpen(false)}
            >
              Batal
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus titik?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type} — {deleteTarget?.location}. Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
