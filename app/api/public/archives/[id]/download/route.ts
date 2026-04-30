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
  return base || "arsip";
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
 * GET /api/public/archives/:id/download
 * Proxy download so the browser always downloads (Content-Disposition: attachment).
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
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

    const safeUrl = await resolveDownloadUrl(doc.downloadUrl, req);
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
    const filename = contentType.includes("pdf")
      ? `${filenameBase}.pdf`
      : filenameBase;
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (error) {
    return downloadErrorResponse(error);
  }
}

