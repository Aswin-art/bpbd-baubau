import { headers } from "next/headers";

/**
 * Origin for same-host fetches from Server Components (e.g. metadata calling a Route Handler).
 */
export async function getInternalSiteOrigin(): Promise<string> {
  const envOrigin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (envOrigin) {
    return envOrigin.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const rawProto = h.get("x-forwarded-proto");
      const proto =
        rawProto?.split(",")[0]?.trim() ||
        (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
      return `${proto}://${host}`;
    }

    return "http://localhost:3000";
  }

  throw new Error("Internal site origin is not configured.");
}
