"use client";

import { useState } from "react";
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
} from "@/components/ui/card";
import type { DocumentItem } from "@/data/dummy-data";

interface DocumentFormProps {
  initialData?: DocumentItem;
}

export function DocumentForm({ initialData }: DocumentFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [category, setCategory] = useState<DocumentItem["category"] | "">(
    initialData?.category ?? "",
  );
  const [fileSize, setFileSize] = useState(initialData?.fileSize ?? "");
  const [downloadUrl, setDownloadUrl] = useState(
    initialData?.downloadUrl ?? "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submit:", { name, description, category, fileSize, downloadUrl });
    router.push("/dashboard/documents");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Dokumen" : "Dokumen Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nama dokumen</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama dokumen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat dokumen"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={category}
              onValueChange={(v) =>
                setCategory(v as DocumentItem["category"])
              }
              required
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sop">SOP</SelectItem>
                <SelectItem value="regulasi">Regulasi</SelectItem>
                <SelectItem value="pedoman">Pedoman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileSize">Ukuran file</Label>
            <Input
              id="fileSize"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="contoh: 2.4 MB"
              readOnly={!isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downloadUrl">URL file</Label>
            <Input
              id="downloadUrl"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {isEdit ? "Simpan" : "Tambah Dokumen"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/documents">Batal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
