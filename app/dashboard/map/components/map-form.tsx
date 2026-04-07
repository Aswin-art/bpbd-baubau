"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";

const TYPE_OPTIONS = [
  "Banjir",
  "Tanah Longsor",
  "Angin Puting Beliung",
  "Kebakaran",
  "Gelombang Tinggi",
];

interface MapFormProps {
  initialData?: MapDisasterPointDTO;
}

export function MapForm({ initialData }: MapFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    type: initialData?.type ?? "Banjir",
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (parseFloat(value) || 0) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(isEdit ? "Updating point:" : "Creating point:", form);
    router.push("/dashboard/map");
  }

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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="type">Jenis Bencana</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
            >
              <SelectTrigger id="type">
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
            <Label htmlFor="location">Lokasi</Label>
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
              <Label htmlFor="kecamatan">Kecamatan</Label>
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
              <Label htmlFor="date">Tanggal (teks)</Label>
              <Input
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="contoh: 1 April 2026"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lat">Lintang</Label>
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
              <Label htmlFor="lng">Bujur</Label>
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
            <Label htmlFor="image">URL Gambar</Label>
            <Input
              id="image"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
            />
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
                type="number"
                min={0}
                value={form.casualties}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displaced">Mengungsi</Label>
              <Input
                id="displaced"
                name="displaced"
                type="number"
                min={0}
                value={form.displaced}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {isEdit ? "Simpan" : "Tambah Titik"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/map">Batal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
