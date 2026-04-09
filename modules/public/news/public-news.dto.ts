import { z } from "zod";

export const publicNewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  category: z.string(),
  publishedAt: z.string().nullable(),
});

export type PublicNewsItem = z.infer<typeof publicNewsItemSchema>;

export const publicNewsListResponseSchema = z.object({
  items: z.array(publicNewsItemSchema),
});

export type PublicNewsListResponse = z.infer<typeof publicNewsListResponseSchema>;

