/** Unwrap `fetch().json()` body: either a raw array or `{ status, data }` from `apiSuccess`. */
export function unwrapApiArrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload !== null &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: unknown[] }).data;
  }
  return [];
}
