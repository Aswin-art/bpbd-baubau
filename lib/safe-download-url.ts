import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { AppError } from "@/lib/app-error";

function isPrivateIp(ip: string): boolean {
  if (ip.includes(".")) {
    const [a, b] = ip.split(".").map((x) => Number.parseInt(x || "0", 10));
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
    return false;
  }

  const s = ip.toLowerCase();
  if (s === "::1") return true;
  if (s.startsWith("fe80:")) return true;
  if (s.startsWith("fc") || s.startsWith("fd")) return true;
  return false;
}

async function assertPublicHostname(hostname: string) {
  const normalizedHost = hostname.toLowerCase();
  if (normalizedHost === "localhost" || normalizedHost.endsWith(".localhost")) {
    throw AppError.badRequest("Blocked download host", "INVALID_DOWNLOAD_HOST");
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw AppError.badRequest("Blocked private download host", "INVALID_DOWNLOAD_HOST");
    }
    return;
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  for (const record of records) {
    if (record.address && isPrivateIp(record.address)) {
      throw AppError.badRequest("Blocked private download host", "INVALID_DOWNLOAD_HOST");
    }
  }
}

export async function parseSafeDownloadUrl(rawUrl: string): Promise<URL> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw AppError.badRequest("Invalid download URL", "INVALID_DOWNLOAD_URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw AppError.badRequest("Unsupported download URL protocol", "INVALID_DOWNLOAD_URL");
  }

  await assertPublicHostname(parsedUrl.hostname);
  return parsedUrl;
}
