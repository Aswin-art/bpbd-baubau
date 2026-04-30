import { NextRequest, NextResponse } from "next/server";

import db from "@/lib/db";
import { AppError } from "@/lib/app-error";
import { parseSafeDownloadUrl } from "@/lib/safe-download-url";

type RouteContext = {
  params: Promise<Record<string, string>>;
};

function safeFilename(name: string): string {
  const base = name
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
  return base || "dokumen";
}

async function resolveDownloadUrl(rawUrl: string, req: NextRequest): Promise<URL> {
  const value = rawUrl.trim();
  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(value);
  if (!hasProtocol) {
    const pathname = value.startsWith("/") ? value : `/${value}`;
    if (
      !value ||
      pathname.startsWith("//") ||
      pathname.startsWith("/api/") ||
      pathname.includes("..")
    ) {
      throw AppError.badRequest("Invalid download URL", "INVALID_DOWNLOAD_URL");
    }
    return new URL(encodeURI(pathname), req.nextUrl.origin);
  }

  return parseSafeDownloadUrl(value);
}

function downloadErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        status: "error" as const,
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode },
    );
  }

  console.error("[Download API Error]", error);
  return NextResponse.json(
    {
      status: "error" as const,
      message: "Internal server error",
    },
    { status: 500 },
  );
}

/**
 * GET /api/public/documents/:id/download
 * Proxy download so the browser always downloads (Content-Disposition: attachment).
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
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

    const safeUrl = await resolveDownloadUrl(doc.downloadUrl, req);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const upstream = await fetch(safeUrl, {
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
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
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    headers.set("Content-Type", contentType);
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("X-Content-Type-Options", "nosniff");

    // Stream the upstream body through.
    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (error) {
    return downloadErrorResponse(error);
  }
}

