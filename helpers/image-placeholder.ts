/**
 * Returns a tiny SVG placeholder encoded as a data-URI.
 * Useful for the `blurDataURL` prop on `<Image>`.
 *
 * @param w - intrinsic width  (default 16)
 * @param h - intrinsic height (default 16)
 * @param color - fill color   (default a neutral gray)
 */
export function shimmerPlaceholder(w = 16, h = 16, color = "#e2e8f0"): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="${color}"/>
    </svg>`;

  return `data:image/svg+xml;base64,${typeof window !== "undefined" ? window.btoa(svg) : Buffer.from(svg).toString("base64")}`;
}

/**
 * Returns a fallback avatar URL (e.g. DiceBear / UI-Avatars).
 * Useful when a user or entity has no profile image.
 *
 * @param name - Display name used to generate initials
 * @param size - Pixel size (square)
 */
export function avatarFallbackUrl(name: string, size = 128): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&size=${size}&background=random&color=fff&bold=true`;
}
