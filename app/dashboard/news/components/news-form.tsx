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
import type { NewsArticle } from "@/data/dummy-data";

interface NewsFormProps {
  initialData?: NewsArticle;
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [content, setContent] = useState(initialData?.content.html ?? "");

  useEffect(() => {
    if (!isEdit) {
      setSlug(generateSlug(title));
    }
  }, [title, isEdit]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { title, slug, excerpt, category, imageUrl, content };
    console.log(isEdit ? "Update article:" : "Create article:", payload);
    router.push("/dashboard/news");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Berita" : "Tambah Berita Baru"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Perbarui informasi artikel berita."
            : "Isi formulir di bawah untuk membuat artikel baru."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              placeholder="Masukkan judul artikel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="slug-artikel"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Otomatis dibuat dari judul. Bisa diubah manual.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edukasi">Edukasi</SelectItem>
                <SelectItem value="siaran-pers">Siaran Pers</SelectItem>
                <SelectItem value="berita-utama">Berita Utama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excerpt">Ringkasan</Label>
            <Textarea
              id="excerpt"
              placeholder="Tulis ringkasan singkat artikel"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">URL Gambar</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Konten</Label>
            <Textarea
              id="content"
              placeholder="Tulis konten artikel (HTML)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {isEdit ? "Simpan" : "Tambah Berita"}
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/news">Batal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
