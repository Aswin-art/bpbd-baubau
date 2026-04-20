/**
 * Shared validation for user-controlled asset URLs (thumbnails, downloads,
 * map photos, profile photos). Allows https/http URLs or same-site paths
 * like `/uploads/...`. Blocks obvious open-redirect / XSS vectors.
 */

const DANGEROUS_SCHEME = /^(javascript|data|vbscript):/i;

export function isSafeHttpOrRelativeAssetUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (DANGEROUS_SCHEME.test(s)) return false;
  if (s.startsWith("//")) return false;

  if (s.startsWith("/")) {
    if (s.includes("..")) return false;
    return true;
  }

  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
