"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const categories = [
  { value: "semua", label: "Semua" },
  { value: "sop", label: "SOP" },
  { value: "regulasi", label: "Regulasi" },
  { value: "pedoman", label: "Pedoman" },
];

export function DocumentFilter({
  activeCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: {
  activeCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
}) {
  const categoryItems = useMemo(() => categories, []);

  return (
    <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
      <div className="flex flex-wrap items-center gap-2.5">
        {categoryItems.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "rounded-full px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors",
              activeCategory === cat.value
                ? "bg-secondary text-secondary-foreground"
                : "border border-border/60 bg-background text-muted-foreground hover:text-secondary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3.5 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          placeholder="Cari dokumen…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Cari dokumen"
        />
      </div>
    </div>
  );
}
