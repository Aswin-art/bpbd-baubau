import { z } from "zod";

// ============================================
// Constants
// ============================================

export const documentCategorySchema = z.string().trim().min(1);
export type DocumentCategory = z.infer<typeof documentCategorySchema>;

// ============================================
// Entity Schema
// ============================================

export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: documentCategorySchema,
  dateLabel: z.string(),
  fileSize: z.string(),
  downloadUrl: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Document = z.infer<typeof documentSchema>;

// ============================================
// Query Params Schemas
// ============================================

export const documentListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional(),
  category: documentCategorySchema.optional(),
});

export type DocumentListParams = z.infer<typeof documentListParamsSchema>;

// ============================================
// Response Schemas
// ============================================

export const documentListResponseSchema = z.object({
  documents: z.array(documentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pageCount: z.number(),
});

export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;

export const documentStatsSchema = z.object({
  total: z.number(),
  byCategory: z.record(z.string(), z.number()),
});

export type DocumentStats = z.infer<typeof documentStatsSchema>;

// ============================================
// Create / Update Schemas (Dashboard)
// ============================================

export const createDocumentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  category: documentCategorySchema,
  dateLabel: z.string().trim().min(2, "Date label is required"),
  downloadUrl: z.string().trim().min(1, "Download URL is required"),
  /**
   * Dihitung otomatis (biasanya dari file upload).
   * Tetap opsional untuk kompatibilitas, backend bisa mengisi jika kosong.
   */
  fileSize: z.string().trim().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = createDocumentSchema.partial();
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const bulkDeleteDocumentsSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one id is required"),
});

export type BulkDeleteDocumentsInput = z.infer<typeof bulkDeleteDocumentsSchema>;

