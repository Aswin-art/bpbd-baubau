export const DEFAULT_MAP_COLOR = "#6b7280";

export const DEFAULT_MAP_TYPE_COLORS: Record<string, string> = {
  Banjir: "#3b82f6",
  "Tanah Longsor": "#f59e0b",
  "Angin Puting Beliung": "#8b5cf6",
  Kebakaran: "#ef4444",
  "Gelombang Tinggi": "#06b6d4",
};

export function normalizeMapColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(withHash)) return null;

  return withHash.toLowerCase();
}

export function getDefaultMapTypeColor(type: string): string {
  return DEFAULT_MAP_TYPE_COLORS[type] ?? DEFAULT_MAP_COLOR;
}

export function getMapTypeColor(type: string, typeColor?: string | null): string {
  return normalizeMapColor(typeColor) ?? getDefaultMapTypeColor(type);
}
