import { z } from "zod";

import { isSafeHttpOrRelativeAssetUrl } from "@/lib/asset-url";
import { PG_INT32_MAX } from "@/lib/pg-int32";

function refineAssetUrls(data: { image?: string; images?: string[] }, ctx: z.RefinementCtx) {
  const imgs = data.images;
  if (imgs) {
    imgs.forEach((u, i) => {
      const t = String(u || "").trim();
      if (t && !isSafeHttpOrRelativeAssetUrl(t)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL gambar tidak valid",
          path: ["images", i],
        });
      }
    });
  }
  if (data.image !== undefined && data.image !== null) {
    const t = String(data.image).trim();
    if (t && !isSafeHttpOrRelativeAssetUrl(t)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL gambar tidak valid",
        path: ["image"],
      });
    }
  }
}

const mapFields = {
  type: z.string().min(1),
  typeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  location: z.string().min(1),
  kecamatan: z.string().min(1),
  date: z.string().min(1),
  description: z.string(),
  lat: z.number(),
  lng: z.number(),
  casualties: z.number().int().min(0).max(PG_INT32_MAX).default(0),
  displaced: z.number().int().min(0).max(PG_INT32_MAX).default(0),
};

/** Dashboard create (single `image`; https or same-site path). */
export const mapDisasterCreateSchema = z.object({
  ...mapFields,
  image: z
    .string()
    .min(1)
    .refine(isSafeHttpOrRelativeAssetUrl, "URL gambar tidak valid"),
});

export type MapDisasterCreateInput = z.infer<typeof mapDisasterCreateSchema>;

export const mapDisasterUpdateSchema = mapDisasterCreateSchema.partial();

export type MapDisasterUpdateInput = z.infer<typeof mapDisasterUpdateSchema>;

const mapDisasterApiBodyBase = z.object({
  ...mapFields,
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  casualties: z.coerce.number().int().min(0).max(PG_INT32_MAX).default(0),
  displaced: z.coerce.number().int().min(0).max(PG_INT32_MAX).default(0),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  description: z.unknown(),
});

/** POST /api/map-disasters — primary image from `image` or first non-empty `images[]`. */
export const mapDisasterApiPostSchema = mapDisasterApiBodyBase.superRefine((data, ctx) => {
  refineAssetUrls(data, ctx);
  const fromImages = data.images?.map((x) => String(x || "").trim()).find(Boolean);
  const fromImage = String(data.image || "").trim();
  const primary = fromImages || fromImage;
  if (!primary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Gambar wajib (image atau images)",
      path: ["image"],
    });
  }
});

export type MapDisasterApiPostInput = z.infer<typeof mapDisasterApiPostSchema>;

/** PATCH /api/map-disasters/:id */
export const mapDisasterApiPatchSchema = mapDisasterApiBodyBase.partial().superRefine((data, ctx) => {
  refineAssetUrls(data, ctx);
});
