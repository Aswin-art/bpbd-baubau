/**
 * Get the base URL for API calls.
 * Works on both client and server components.
 *
 * @returns The base URL (e.g., "http://localhost:3000" or production URL)
 */
export function getBaseUrl(): string {
  // Client-side: use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side: align with `getInternalSiteOrigin` / auth `baseURL`
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}
