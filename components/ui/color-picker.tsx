"use client";

import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
  disabled?: boolean;
  label?: string;
}

export function ColorPicker({
  value,
  onChange,
  presets = [],
  disabled = false,
  label = "Pilih warna",
}: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-11 w-full justify-between px-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-5 w-5 rounded-md border border-border/60 shadow-sm"
                style={{ backgroundColor: value }}
              />
              <span className="font-mono text-sm uppercase">{value}</span>
            </div>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">
              Klik warna, pakai picker bawaan browser, atau isi kode hex.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center">
            <input
              type="color"
              aria-label={label}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              className="h-20 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
            />

            <div className="space-y-2">
              <Label htmlFor="hex-color-input" className="text-xs text-muted-foreground">
                Hex warna
              </Label>
              <Input
                id="hex-color-input"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="font-mono uppercase"
                placeholder="#000000"
              />
            </div>
          </div>

          {presets.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preset</p>
              <div className="grid grid-cols-6 gap-2">
                {presets.map((color) => {
                  const active = value.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={disabled}
                      aria-label={`Pilih warna ${color}`}
                      onClick={() => onChange(color)}
                      className={cn(
                        "h-9 w-full rounded-md border transition-transform hover:scale-[1.03]",
                        active
                          ? "border-foreground ring-2 ring-primary/30"
                          : "border-border/60",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
