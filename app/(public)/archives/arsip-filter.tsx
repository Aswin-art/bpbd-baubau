"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tahunList = ["semua", "2026", "2025", "2024", "2023"];

export function ArsipFilter({
  activeTahun,
  onTahunChange,
}: {
  activeTahun: string;
  onTahunChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <Select value={activeTahun} onValueChange={(v) => onTahunChange(v)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
          {tahunList.map((tahun) => (
            <SelectItem key={tahun} value={tahun}>
              {tahun === "semua" ? "Semua Tahun" : tahun}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
