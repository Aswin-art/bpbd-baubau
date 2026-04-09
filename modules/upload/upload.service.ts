import { AppError } from "@/lib/app-error";
import type { UploadResponse, UploadScope } from "./upload.dto";

interface UploadParams {
  file: File;
  scope?: UploadScope;
}

/**
 * Upload a file to the server
 * Client-side function that calls the API
 */
async function uploadFile(params: UploadParams): Promise<UploadResponse> {
  const { file, scope = "general" } = params;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", scope);

  const response = await fetch(`/api/upload?scope=${scope}`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result.status !== "success") {
    throw new Error(result.message || "Upload failed");
  }

  return {
    url: result.data,
    fileName: file.name,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Service layer for Upload operations.
 * Public API for upload operations - other modules should use this.
 */
export const uploadService = {
  /**
   * Upload a single file
   */
  async upload(params: UploadParams): Promise<UploadResponse> {
    if (!params.file) {
      throw AppError.badRequest("No file provided", "NO_FILE");
    }

    return uploadFile(params);
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    scope?: UploadScope,
  ): Promise<UploadResponse[]> {
    if (files.length === 0) {
      throw AppError.badRequest("No files provided", "NO_FILES");
    }

    const uploadPromises = files.map((file) => uploadFile({ file, scope }));

    return Promise.all(uploadPromises);
  },
};
