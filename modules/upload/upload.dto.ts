import { z } from "zod";

// ============================================
// Enums / Constants
// ============================================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
];

export const uploadScopeSchema = z.enum([
  "articles",
  "general",
  "documents",
  "aspirations",
  "archives",
  "maps",
]);
export type UploadScope = z.infer<typeof uploadScopeSchema>;

// ============================================
// Input Schemas
// ============================================

export const uploadInputSchema = z.object({
  file: z.instanceof(File),
  scope: uploadScopeSchema.optional().default("general"),
});

export type UploadInput = z.infer<typeof uploadInputSchema>;

// ============================================
// Response Schemas
// ============================================

export const uploadResponseSchema = z.object({
  url: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  size: z.number(),
  mimeType: z.string(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
