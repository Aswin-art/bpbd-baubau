import { z } from "zod";

export const userRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  isActive: z.boolean(),
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
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: userRoleSchema.default("masyarakat"),
  isActive: z.boolean().default(true),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  newPassword: z.string().min(6, "Password minimal 6 karakter").optional(),
});
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


