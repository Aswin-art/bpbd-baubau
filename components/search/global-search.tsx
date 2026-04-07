"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Newspaper,
  AlertTriangle,
  MessageSquare,
  Home,
} from "lucide-react";
import { newsArticles, documents } from "@/data/dummy-data";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [mapPoints, setMapPoints] = useState<MapDisasterPointDTO[]>([]);

  useEffect(() => {
    fetch("/api/map-disasters")
      .then((r) => r.json())
      .then((d) => setMapPoints(d.points ?? []))
      .catch(() => setMapPoints([]));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Cari berita, dokumen, atau arsip bencana..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

        <CommandGroup heading="Halaman">
          <CommandItem onSelect={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Beranda
          </CommandItem>
          <CommandItem onSelect={() => navigate("/berita")}>
            <Newspaper className="mr-2 h-4 w-4" />
            Berita
          </CommandItem>
          <CommandItem onSelect={() => navigate("/dokumen")}>
            <FileText className="mr-2 h-4 w-4" />
            Dokumen & SOP
          </CommandItem>
          <CommandItem onSelect={() => navigate("/aspirasi")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Aspirasi
          </CommandItem>
          <CommandItem onSelect={() => navigate("/arsip")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Arsip Bencana
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Berita Terkini">
          {newsArticles.slice(0, 4).map((news) => (
            <CommandItem
              key={news.slug}
              onSelect={() => navigate(`/berita/${news.slug}`)}
            >
              <Newspaper className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{news.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Dokumen">
          {documents.slice(0, 4).map((doc) => (
            <CommandItem key={doc.id} onSelect={() => navigate("/dokumen")}>
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{doc.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Titik peta (map)">
          {mapPoints.slice(0, 3).map((record) => (
            <CommandItem
              key={record.id}
              onSelect={() => navigate(`/arsip/${record.id}`)}
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {record.type} — {record.location}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
