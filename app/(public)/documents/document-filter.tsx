"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentFilter({
  activeCategory,
  categories,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: {
  activeCategory: string;
  categories: string[];
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
}) {
  const categoryItems = ["semua", ...categories];

  return (
    <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
      <div className="flex flex-wrap items-center gap-2.5">
        <Select
          value={activeCategory}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="h-10 w-[200px] border-2 border-border bg-card font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((cat) => (
              <SelectItem
                key={cat}
                value={cat}
                className="font-mono text-xs font-bold uppercase tracking-widest"
              >
                {cat === "semua" ? "Semua" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 border-2 border-border bg-card px-4 py-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 h-10">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
        <input
          placeholder="Cari dokumen…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Cari dokumen"
        />
      </div>
    </div>
  );
}
