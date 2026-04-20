import { NextRequest } from "next/server";

import db from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { parseSafeDownloadUrl } from "@/lib/safe-download-url";

function safeFilename(name: string): string {
  const base = name
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
  return base || "arsip";
}

/**
 * GET /api/public/archives/:id/download
 * Proxy download so the browser always downloads (Content-Disposition: attachment).
 */
export const GET = apiHandler(async (_req: NextRequest, context) => {
  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Missing id", "MISSING_ID");
  }

  const doc = await db.arsipDocument.findUnique({
    where: { id },
    select: { id: true, name: true, downloadUrl: true },
  });
  if (!doc) throw AppError.notFound("Archive not found", "NOT_FOUND");
  if (!doc.downloadUrl) {
    throw AppError.badRequest("Missing download url", "MISSING_DOWNLOAD_URL");
  }

  const safeUrl = await parseSafeDownloadUrl(doc.downloadUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const upstream = await fetch(safeUrl, {
    cache: "no-store",
    redirect: "manual",
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
  if (!upstream.ok || !upstream.body) {
    throw AppError.badRequest("Failed to fetch archive", "UPSTREAM_ERROR");
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);

  const filenameBase = safeFilename(doc.name);
  const filename = contentType.includes("pdf") ? `${filenameBase}.pdf` : filenameBase;
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, { status: 200, headers });
});

