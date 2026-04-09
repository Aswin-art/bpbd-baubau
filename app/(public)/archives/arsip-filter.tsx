"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ArsipFilter({
  activeTahun,
  onTahunChange,
  years,
  disabled,
}: {
  activeTahun: string;
  onTahunChange: (value: string) => void;
  years: string[];
  disabled?: boolean;
}) {
  const tahunList = ["semua", ...years];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <Select
        value={activeTahun}
        onValueChange={(v) => onTahunChange(v)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full sm:w-40" disabled={disabled}>
          <SelectValue placeholder={disabled ? "Memuat…" : "Pilih Tahun"} />
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
