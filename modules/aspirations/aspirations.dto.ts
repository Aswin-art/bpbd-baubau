import { z } from "zod";

// ============================================
// Enums / Constants
// ============================================

export const aspirationStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "rejected",
]);
export type AspirationStatus = z.infer<typeof aspirationStatusSchema>;

// ============================================
// Entity Schema
// ============================================

export const aspirationSchema = z.object({
  id: z.string(),
  submitterName: z.string(),
  description: z.string(),
  status: aspirationStatusSchema,
  adminReply: z.string().nullable().optional(),
  repliedAt: z.date().or(z.string()).nullable().optional(),
  repliedById: z.string().nullable().optional(),
  userId: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Aspiration = z.infer<typeof aspirationSchema>;

// ============================================
// Query Params Schemas
// ============================================

export const aspirationListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional(),
  status: aspirationStatusSchema.optional(),
});

export type AspirationListParams = z.infer<typeof aspirationListParamsSchema>;

// ============================================
// Response Schemas
// ============================================

export const aspirationListResponseSchema = z.object({
  aspirations: z.array(aspirationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pageCount: z.number(),
});

export type AspirationListResponse = z.infer<typeof aspirationListResponseSchema>;

export const aspirationStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  in_progress: z.number(),
  completed: z.number(),
  rejected: z.number(),
});

export type AspirationStats = z.infer<typeof aspirationStatsSchema>;

export const bulkChangeStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: aspirationStatusSchema,
});

export type BulkChangeStatusInput = z.infer<typeof bulkChangeStatusSchema>;

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

// ============================================
// Create / Update Schemas (Dashboard)
// ============================================

export const createAspirationSchema = z.object({
  submitterName: z.string().trim().min(2, "Nama minimal 2 karakter"),
  description: z.string().trim().min(5, "Deskripsi minimal 5 karakter"),
  status: aspirationStatusSchema.optional(),
});

export type CreateAspirationInput = z.infer<typeof createAspirationSchema>;

export const updateAspirationSchema = createAspirationSchema.partial().extend({
  status: aspirationStatusSchema.optional(),
});

export type UpdateAspirationInput = z.infer<typeof updateAspirationSchema>;

export const replyAspirationSchema = z.object({
  adminReply: z.string().trim().min(2, "Balasan minimal 2 karakter"),
});

export type ReplyAspirationInput = z.infer<typeof replyAspirationSchema>;

