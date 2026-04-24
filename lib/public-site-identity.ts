/**
 * Branding copy shown in navbar, footer, and map iframe titles.
 * Intentionally static (not from database).
 */
export const PUBLIC_SITE_NAME = "BPBD Kota Baubau";

export const PUBLIC_FOOTER_TAGLINE = "Sigap. Tanggap. Melindungi.";

export const PUBLIC_FOOTER_BYLINE_PARTS = [
  "Pemerintah Kota Baubau",
  "Sulawesi Tenggara",
] as const;

export const MAP_EMBED_IFRAME_TITLE = `Peta lokasi — ${PUBLIC_SITE_NAME}`;

/** Satu paragraf pengantar di footer (tidak dari database). */
export const PUBLIC_FOOTER_SHORT_DESCRIPTION =
  "Informasi, layanan, dan kontak resmi untuk kesiapsiagaan dan respons kebencanaan.";
