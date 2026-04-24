/** User-facing copy when a site field is not set in the database. */

export const ABOUT_SECTION_DB_PLACEHOLDER =
  "Deskripsi belum diisi. Tambahkan lewat Dashboard → Pengaturan Situs → Tentang (deskripsi).";

export const OFFICE_ADDRESS_FALLBACK =
  "Alamat kantor: belum diatur (Dashboard → Pengaturan Situs → Alamat kantor).";

export const MAP_PLACEHOLDER_TITLE =
  "Peta: tambahkan “Map embed URL” di pengaturan situs.";

export const PHONE_FALLBACK = "— (atur nomor di pengaturan)";

export const EMAIL_FALLBACK = "— (atur email di pengaturan)";

export function toTelHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const d = phone.replace(/[^\d+]/g, "");
  return d ? `tel:${d}` : null;
}
