/**
 * Upload Module - Public API
 *
 * This module provides upload functionality with layered architecture.
 * - DTOs: Type definitions and schemas
 * - Service: Business logic for uploads
 * - Hooks: React Query hooks for client-side usage
 */

// Service (main entry point for business logic)
export { uploadService } from "./upload.service";

// React Query hooks (client-side)
export {
  useUpload,
  useMultipleUpload,
  createUploadHandler,
  createMultipleUploadHandler,
} from "./upload.hooks";

// DTOs and types
export * from "./upload.dto";
