"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
        {categoryItems.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "border-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-colors",
              activeCategory === cat
                ? "border-secondary bg-secondary text-secondary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {cat === "semua" ? "Semua" : cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 border-2 border-border bg-card px-4 py-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
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
