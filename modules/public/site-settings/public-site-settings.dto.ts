import { z } from "zod";

export const publicSiteSettingsSchema = z.object({
  id: z.string(),
  aboutDescription: z.string().nullable().optional(),
  aboutProfileUrl: z.string().nullable().optional(),
  objectives: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  socialInstagram: z.string().nullable().optional(),
  socialX: z.string().nullable().optional(),
  socialTiktok: z.string().nullable().optional(),
});

export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;

export const publicSiteSettingsResponseSchema = z.object({
  settings: publicSiteSettingsSchema,
});

export type PublicSiteSettingsResponse = z.infer<
  typeof publicSiteSettingsResponseSchema
>;

