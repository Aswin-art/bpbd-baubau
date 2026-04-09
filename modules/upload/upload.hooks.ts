"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadService } from "./upload.service";
import type { UploadResponse, UploadScope } from "./upload.dto";

interface UseUploadOptions {
  scope?: UploadScope;
  onSuccess?: (data: UploadResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * React Query hook for single file upload
 */
export function useUpload(options: UseUploadOptions = {}) {
  const { scope = "general", onSuccess, onError } = options;

  return useMutation({
    mutationFn: (file: File) => uploadService.upload({ file, scope }),
    onSuccess,
    onError,
  });
}

interface UseMultipleUploadOptions {
  scope?: UploadScope;
  onSuccess?: (data: UploadResponse[]) => void;
  onError?: (error: Error) => void;
}

/**
 * React Query hook for multiple file upload
 */
export function useMultipleUpload(options: UseMultipleUploadOptions = {}) {
  const { scope = "general", onSuccess, onError } = options;

  return useMutation({
    mutationFn: (files: File[]) => uploadService.uploadMultiple(files, scope),
    onSuccess,
    onError,
  });
}

/**
 * Helper function to create upload handler for FileUpload component
 * This returns a function compatible with FileUpload's onUpload prop
 */
export function createUploadHandler(
  uploadMutation: ReturnType<typeof useUpload>,
): (file: File) => Promise<string> {
  return async (file: File) => {
    const result = await uploadMutation.mutateAsync(file);
    return result.url;
  };
}

/**
 * Helper function to create upload handler for FileUpload component
 * (multiple mode). Returns a function compatible with FileUpload's onUpload.
 */
export function createMultipleUploadHandler(
  uploadMutation: ReturnType<typeof useMultipleUpload>,
): (file: File) => Promise<string> {
  return async (file: File) => {
    const [result] = await uploadMutation.mutateAsync([file]);
    return result?.url || "";
  };
}
