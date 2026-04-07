/**
 * URL absolut untuk share / OG. Set `NEXT_PUBLIC_SITE_URL` (mis. https://bpbd.baubau.go.id).
 * `VERCEL_URL` dipakai sebagai fallback di Vercel (tanpa skema).
 */
export function absoluteUrlForPath(path: string): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!raw) return "";
  const base = raw.startsWith("http") ? raw : `https://${raw}`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

/**
 * URL absolut untuk share (mis. react-share). Prioritas env, lalu header request.
 */
export function shareUrlForPath(
  path: string,
  requestHeaders: Headers,
): string {
  const fromEnv = absoluteUrlForPath(path);
  if (fromEnv) return fromEnv;
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  if (!host) return "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${proto}://${host.replace(/\/$/, "")}${normalized}`;
}
