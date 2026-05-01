import { z } from "zod";

import { isSafeHttpOrRelativeAssetUrl } from "@/lib/asset-url";
import { sanitizePhoneInput } from "@/lib/phone-input";

export const USER_PASSWORD_MIN_LENGTH = 8;

export const userRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  photoUrl: z.string().nullable().optional(),
  bio: z.unknown().optional(),
  phoneNumber: z.string().nullable().optional(),
  homeAddress: z.string().nullable().optional(),
  dateOfBirth: z.date().or(z.string()).nullable().optional(),
  isActive: z.boolean(),
  banned: z.boolean().optional().default(false),
  emailVerified: z.boolean(),
  lastLoginAt: z.date().or(z.string()).nullable(),
  createdAt: z.date().or(z.string()),
});

export type UserRow = z.infer<typeof userRowSchema>;

export const userListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional(),
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type UserListParams = z.infer<typeof userListParamsSchema>;

export const userListResponseSchema = z.object({
  users: z.array(userRowSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pageCount: z.number(),
});

export type UserListResponse = z.infer<typeof userListResponseSchema>;

// ============================================
// Create / Update Schemas (Dashboard)
// ============================================

export const userRoleSchema = z.enum([
  "admin",
  "operator",
  "kepala_bpbd",
  "masyarakat",
]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(USER_PASSWORD_MIN_LENGTH, `Password minimal ${USER_PASSWORD_MIN_LENGTH} karakter`),
  role: userRoleSchema.default("masyarakat"),
  photoUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => v === undefined || v === "" || isSafeHttpOrRelativeAssetUrl(v), "URL foto tidak valid"),
  isActive: z.boolean().default(true),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").optional(),
    email: z
      .string()
      .trim()
      .email("Email tidak valid")
      .transform((v) => v.toLowerCase())
      .optional(),
    role: userRoleSchema.optional(),
    photoUrl: z
      .string()
      .trim()
      .optional()
      .refine((v) => v === undefined || v === "" || isSafeHttpOrRelativeAssetUrl(v), "URL foto tidak valid"),
    bio: z.unknown().optional(),
    phoneNumber: z
      .preprocess(
        (v) =>
          v === undefined || v === null
            ? undefined
            : sanitizePhoneInput(String(v).trim()),
        z.string().optional(),
      )
      .refine(
        (v) => v == null || v === "" || /\d/.test(v),
        "Nomor telepon harus memuat angka",
      ),
    homeAddress: z
      .preprocess(
        (v) => (v === undefined || v === null ? undefined : String(v).trim()),
        z.string().optional(),
      ),
    dateOfBirth: z
      .preprocess(
        (v) => (v === undefined ? undefined : v === "" || v === null ? null : v),
        z.coerce.date().nullable().optional(),
      )
      .optional(),
    isActive: z.boolean().optional(),
    newPassword: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
      z.string().min(USER_PASSWORD_MIN_LENGTH, `Password minimal ${USER_PASSWORD_MIN_LENGTH} karakter`).optional(),
    ),
  })
  .refine(
    (v) => Object.values(v).some((value) => value !== undefined),
    "No fields to update",
  );
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const bulkSetActiveSchema = z.object({
  ids: z.array(z.string()).min(1),
  isActive: z.boolean(),
});
export type BulkSetActiveInput = z.infer<typeof bulkSetActiveSchema>;

export const bulkDeleteUsersSchema = z.object({
  ids: z.array(z.string()).min(1),
});
export type BulkDeleteUsersInput = z.infer<typeof bulkDeleteUsersSchema>;


