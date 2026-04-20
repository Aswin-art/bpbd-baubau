import { z } from "zod";

import { isSafeHttpOrRelativeAssetUrl } from "@/lib/asset-url";

// ============================================
// Entity Schema
// ============================================

export const archiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dateLabel: z.string(),
  fileSize: z.string().optional(),
  year: z.string(),
  downloadUrl: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Archive = z.infer<typeof archiveSchema>;

// ============================================
// Query Params Schemas
// ============================================

export const archiveListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional(),
  year: z.string().optional(),
});

export type ArchiveListParams = z.infer<typeof archiveListParamsSchema>;

// ============================================
// Response Schemas
// ============================================

export const archiveListResponseSchema = z.object({
  archives: z.array(archiveSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pageCount: z.number(),
});

export type ArchiveListResponse = z.infer<typeof archiveListResponseSchema>;

export const archiveStatsSchema = z.object({
  total: z.number(),
  years: z.number(),
  latestYear: z.string().nullable(),
  latestYearCount: z.number(),
});

export type ArchiveStats = z.infer<typeof archiveStatsSchema>;

// ============================================
// Create / Update Schemas (Dashboard)
// ============================================

export const createArchiveSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().trim().min(1, "Description is required"),
  year: z
    .string()
    .trim()
    .min(4, "Year is required")
    .regex(/^\d{4}$/, "Tahun harus 4 digit angka"),
  dateLabel: z.string().trim().min(2, "Date label is required"),
  downloadUrl: z
    .string()
    .trim()
    .min(1, "Download URL is required")
    .refine(isSafeHttpOrRelativeAssetUrl, "Download URL tidak valid"),
  /**
   * Dihitung otomatis (biasanya dari file upload).
   * Tetap opsional untuk kompatibilitas data lama.
   */
  fileSize: z.string().trim().optional(),
});

export type CreateArchiveInput = z.infer<typeof createArchiveSchema>;

export const updateArchiveSchema = createArchiveSchema.partial();
export type UpdateArchiveInput = z.infer<typeof updateArchiveSchema>;

export const bulkDeleteArchivesSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one id is required"),
});

export type BulkDeleteArchivesInput = z.infer<typeof bulkDeleteArchivesSchema>;

