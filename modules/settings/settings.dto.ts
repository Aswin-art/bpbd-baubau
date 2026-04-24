import { z } from "zod";

import { isSafeHttpOrRelativeAssetUrl } from "@/lib/asset-url";

// ============================================
// HeroSlide
// ============================================

export const heroSlideSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  imageUrl: z.string(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  linkUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type HeroSlide = z.infer<typeof heroSlideSchema>;

export const heroSlideListParamsSchema = z.object({
  includeInactive: z.coerce.boolean().optional(),
});

export type HeroSlideListParams = z.infer<typeof heroSlideListParamsSchema>;

export const createHeroSlideSchema = z.object({
  sortOrder: z.coerce.number().int().optional(),
  imageUrl: z
    .string()
    .trim()
    .min(1, "URL gambar wajib diisi")
    .refine(isSafeHttpOrRelativeAssetUrl, "URL gambar tidak valid"),
  title: z.string().trim().optional().nullable(),
  subtitle: z.string().trim().optional().nullable(),
  linkUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === "" || isSafeHttpOrRelativeAssetUrl(v),
      "URL tautan tidak valid",
    ),
  isActive: z.boolean().default(true),
});

export type CreateHeroSlideInput = z.infer<typeof createHeroSlideSchema>;

export const updateHeroSlideSchema = createHeroSlideSchema.partial();
export type UpdateHeroSlideInput = z.infer<typeof updateHeroSlideSchema>;

export const reorderHeroSlidesSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type ReorderHeroSlidesInput = z.infer<typeof reorderHeroSlidesSchema>;

// ============================================
// SiteSettings (singleton)
// ============================================

export const siteSettingsSchema = z.object({
  id: z.string(),
  officeAddress: z.string().nullable().optional(),
  aboutDescription: z.string().nullable().optional(),
  objectives: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  structurePhotoUrl: z.string().nullable().optional(),
  officePhotoUrl: z.string().nullable().optional(),
  mapEmbedUrl: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  socialInstagram: z.string().nullable().optional(),
  socialX: z.string().nullable().optional(),
  socialTiktok: z.string().nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const updateSiteSettingsSchema = z
  .object({
    officeAddress: z.string().trim().nullable().optional(),
    aboutDescription: z.string().trim().nullable().optional(),
    objectives: z.string().trim().nullable().optional(),
    goals: z.string().trim().nullable().optional(),
    structurePhotoUrl: z.string().trim().nullable().optional(),
    officePhotoUrl: z.string().trim().nullable().optional(),
    mapEmbedUrl: z.string().trim().nullable().optional(),
    contactEmail: z.string().trim().nullable().optional(),
    contactPhone: z.string().trim().nullable().optional(),
    socialInstagram: z.string().trim().nullable().optional(),
    socialX: z.string().trim().nullable().optional(),
    socialTiktok: z.string().trim().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    const urlKeys = ["structurePhotoUrl", "officePhotoUrl", "mapEmbedUrl"] as const;
    for (const key of urlKeys) {
      const v = val[key];
      if (v != null && String(v).trim() !== "" && !isSafeHttpOrRelativeAssetUrl(String(v))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL tidak valid",
          path: [key],
        });
      }
    }

    const rawPhone = val.contactPhone;
    if (rawPhone != null && String(rawPhone).trim() !== "") {
      if (/\p{L}/u.test(String(rawPhone))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor telepon tidak boleh berisi huruf (angka, spasi, +, tanda baca).",
          path: ["contactPhone"],
        });
      }
    }
  });

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

