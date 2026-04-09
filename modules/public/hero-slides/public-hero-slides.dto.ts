import { z } from "zod";

export const publicHeroSlideSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  imageUrl: z.string(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  linkUrl: z.string().nullable(),
  isActive: z.boolean(),
});

export type PublicHeroSlide = z.infer<typeof publicHeroSlideSchema>;

export const publicHeroSlidesResponseSchema = z.object({
  slides: z.array(publicHeroSlideSchema),
});

export type PublicHeroSlidesResponse = z.infer<
  typeof publicHeroSlidesResponseSchema
>;

