"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

import type {
  PublicArchiveDisasterDetail,
  PublicDisasterPhoto,
} from "@/lib/public-archive-disaster-detail";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryPoint = Pick<
  PublicArchiveDisasterDetail["point"],
  "id" | "image" | "type" | "location" | "photos"
>;

/** Gabungkan `DisasterPhoto` (urut sortOrder); dedupe URL; fallback ke `MapDisasterPoint.image`. */
function buildGalleryItems(point: GalleryPoint): PublicDisasterPhoto[] {
  const seen = new Set<string>();
  const out: PublicDisasterPhoto[] = [];
  for (const p of point.photos) {
    const u = p.url.trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(p);
  }
  if (out.length === 0 && point.image.trim()) {
    out.push({
      id: `${point.id}-cover`,
      url: point.image.trim(),
      caption: null,
      sortOrder: 0,
    });
  }
  return out;
}

export function ArchiveDisasterGallery({ point }: { point: GalleryPoint }) {
  const items = useMemo(() => buildGalleryItems(point), [point]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  const go = (dir: -1 | 1) => {
    setIndex((i) => {
      const n = items.length;
      return (i + dir + n) % n;
    });
  };

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const current = items[index];
  const altBase = `${point.type} — ${point.location}`;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-0 flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-primary" />
        <Images className="h-4 w-4 shrink-0" aria-hidden />
        Galeri bencana
      </h2>
      <p className="text-xs text-muted-foreground">
        Album foto dari data titik bencana. Jika belum ada beberapa foto, yang
        tampil adalah gambar utama titik ini.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openAt(i)}
            className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-muted text-left shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={photo.url}
              alt={photo.caption ? `${altBase}: ${photo.caption}` : altBase}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            {photo.caption ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-2 pt-10">
                <span className="line-clamp-2 text-[11px] leading-snug text-white">
                  {photo.caption}
                </span>
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className={cn(
            "max-w-[min(100vw-2rem,56rem)] gap-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 sm:max-w-[56rem]",
            "[&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:z-10 [&_[data-slot=dialog-close]]:text-zinc-200 [&_[data-slot=dialog-close]]:hover:bg-white/10",
          )}
        >
          <DialogTitle className="sr-only">
            {current?.caption ? `${altBase}: ${current.caption}` : altBase}
          </DialogTitle>
          <div className="flex flex-col gap-3 p-3 sm:p-5">
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-black sm:aspect-video">
              {current ? (
                <Image
                  src={current.url}
                  alt={current.caption ? `${altBase}: ${current.caption}` : altBase}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              ) : null}
            </div>
            {current?.caption ? (
              <p className="px-1 text-center text-sm text-zinc-200">
                {current.caption}
              </p>
            ) : null}
            {items.length > 1 ? (
              <div className="flex items-center justify-center gap-2 pb-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                  onClick={() => go(-1)}
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="min-w-[4rem] text-center text-xs tabular-nums text-zinc-400">
                  {index + 1} / {items.length}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                  onClick={() => go(1)}
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
