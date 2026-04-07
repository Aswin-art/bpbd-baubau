import { z } from "zod";

export const mapDisasterCreateSchema = z.object({
  type: z.string().min(1),
  location: z.string().min(1),
  kecamatan: z.string().min(1),
  date: z.string().min(1),
  description: z.string(),
  image: z.string().url(),
  lat: z.number(),
  lng: z.number(),
  casualties: z.number().int().min(0).default(0),
  displaced: z.number().int().min(0).default(0),
});

export type MapDisasterCreateInput = z.infer<typeof mapDisasterCreateSchema>;

export const mapDisasterUpdateSchema = mapDisasterCreateSchema.partial();

export type MapDisasterUpdateInput = z.infer<typeof mapDisasterUpdateSchema>;
