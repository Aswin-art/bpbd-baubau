import { NextRequest } from "next/server";

import db from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";

function safeFilename(name: string): string {
  const base = name
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
  return base || "dokumen";
}

/**
 * GET /api/public/documents/:id/download
 * Proxy download so the browser always downloads (Content-Disposition: attachment).
 */
export const GET = apiHandler(async (req: NextRequest, context) => {
  const params = (await context?.params) || {};
  const id = params["id"];
  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Missing id", "MISSING_ID");
  }

  const doc = await db.document.findUnique({
    where: { id },
    select: { id: true, name: true, downloadUrl: true },
  });
  if (!doc) throw AppError.notFound("Document not found", "NOT_FOUND");
  if (!doc.downloadUrl) {
    throw AppError.badRequest("Missing download url", "MISSING_DOWNLOAD_URL");
  }

  const upstream = await fetch(doc.downloadUrl);
  if (!upstream.ok || !upstream.body) {
    throw AppError.badRequest("Failed to fetch document", "UPSTREAM_ERROR");
  }

  const extFromType = () => {
    const ct = upstream.headers.get("content-type") || "";
    if (ct.includes("pdf")) return "pdf";
    if (ct.includes("msword")) return "doc";
    if (ct.includes("officedocument.wordprocessingml")) return "docx";
    if (ct.includes("officedocument.spreadsheetml")) return "xlsx";
    if (ct.includes("officedocument.presentationml")) return "pptx";
    return "";
  };

  const filenameBase = safeFilename(doc.name);
  const ext = extFromType();
  const filename = ext ? `${filenameBase}.${ext}` : filenameBase;

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  headers.set("Content-Type", contentType);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("X-Content-Type-Options", "nosniff");

  // Stream the upstream body through.
  return new Response(upstream.body, { status: 200, headers });
});

