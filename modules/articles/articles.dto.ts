import { z } from "zod";

// ============================================
// Enums / Constants
// ============================================

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

// Category is flexible - any string value
export const articleCategorySchema = z.string().min(1, "Category is required");

// ============================================
// Entity Schema
// ============================================

export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.any(),
  excerpt: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  category: z.string(),
  status: articleStatusSchema,
  publishedAt: z.date().or(z.string()).nullable(),
  authorId: z.string(),
  authorName: z.string().optional(),
  /** Jumlah komentar (hanya di daftar dashboard). */
  commentCount: z.number().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type Article = z.infer<typeof articleSchema>;

// ============================================
// Input Schemas (Create/Update)
// ============================================

export const createArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    ),
  content: z.any(), // BlockNote JSON blocks
  excerpt: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  category: articleCategorySchema,
  status: articleStatusSchema.default("DRAFT"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

// For API route validation (includes id from path params)
export const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.string(),
});

// For service layer (id passed separately)
export const updateArticleInputSchema = createArticleSchema.partial();

export type UpdateArticleInput = z.infer<typeof updateArticleInputSchema>;

// ============================================
// Response Schemas
// ============================================

export const articleListResponseSchema = z.object({
  articles: z.array(articleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pageCount: z.number(),
});

export type ArticleListResponse = z.infer<typeof articleListResponseSchema>;

export const articleStatsSchema = z.object({
  total: z.number(),
  published: z.number(),
  draft: z.number(),
  archived: z.number(),
});

export type ArticleStats = z.infer<typeof articleStatsSchema>;

// ============================================
// Query Params Schemas
// ============================================

export const articleListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: articleStatusSchema.optional(),
});

export type ArticleListParams = z.infer<typeof articleListParamsSchema>;

