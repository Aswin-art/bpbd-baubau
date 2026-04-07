import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Get current session (server-side)
 */
export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
