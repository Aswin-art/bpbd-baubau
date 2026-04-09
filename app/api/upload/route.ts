import { NextRequest, NextResponse } from "next/server";
import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import {
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
  uploadScopeSchema,
} from "@/modules/upload/upload.dto";

/**
 * POST /api/upload - Upload a file
 * Requires: Authenticated session
 */
export const POST = apiHandler(async (req: NextRequest) => {
  // Authentication check
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const rawScope =
    req.nextUrl.searchParams.get("scope") ?? formData.get("scope");
  const parsedScope = uploadScopeSchema.safeParse(rawScope);
  const safeScope = parsedScope.success ? parsedScope.data : "general";

  if (!file) {
    throw AppError.badRequest("No file uploaded", "NO_FILE");
  }

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    throw AppError.badRequest("File size exceeds 5MB limit", "FILE_TOO_LARGE");
  }

  // File extension validation
  let extension = file.name.split(".").pop()?.toLowerCase();

  // If no valid explicit extension in name (often happens with blobs), derive it from mimetype
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    const mimeTypeStr = file.type || "";
    // e.g. "image/jpeg" -> "jpeg", "image/png" -> "png"
    const derivedExt = mimeTypeStr.split("/").pop()?.toLowerCase();

    if (derivedExt && ALLOWED_EXTENSIONS.includes(derivedExt)) {
      extension = derivedExt;
    } else {
      throw AppError.badRequest("File type not allowed", "INVALID_FILE_TYPE");
    }
  }

  // Safe scope is already parsed and validated above

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const uniqueId = crypto.randomUUID();
  const fileName = `${uniqueId}.${extension}`;

  // Ensure upload directory exists
  const uploadDir = join(process.cwd(), "public", "uploads", safeScope);
  await mkdir(uploadDir, { recursive: true });

  // Write file
  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return apiSuccess(`/uploads/${safeScope}/${fileName}`);
});
