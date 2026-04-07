"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import type { ArchiveDocument } from "@/data/dummy-data";

interface ArchiveFormProps {
  initialData?: ArchiveDocument;
}

export function ArchiveForm({ initialData }: ArchiveFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description.text ?? "",
    year: initialData?.year ?? "",
    dateLabel: initialData?.dateLabel ?? "",
    fileSize: initialData?.fileSize ?? "",
    downloadUrl: initialData?.downloadUrl ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(isEdit ? "Updating archive:" : "Creating archive:", form);
    router.push("/dashboard/archives");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Arsip" : "Tambah Arsip Baru"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Perbarui informasi dokumen arsip."
            : "Isi form di bawah untuk menambahkan arsip baru."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Judul</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Judul laporan arsip"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi singkat dokumen"
              rows={3}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">Tahun</Label>
              <Input
                id="year"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateLabel">Tanggal Dokumen</Label>
              <Input
                id="dateLabel"
                name="dateLabel"
                value={form.dateLabel}
                onChange={handleChange}
                placeholder="1 Januari 2026"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fileSize">Ukuran File</Label>
              <Input
                id="fileSize"
                name="fileSize"
                value={form.fileSize}
                onChange={handleChange}
                placeholder="2.4 MB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downloadUrl">URL Download</Label>
              <Input
                id="downloadUrl"
                name="downloadUrl"
                value={form.downloadUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {isEdit ? "Simpan" : "Tambah Arsip"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/archives">Batal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
