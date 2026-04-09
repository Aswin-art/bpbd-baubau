import { z } from "zod";

export const roleIdSchema = z.enum([
  "admin",
  "operator",
  "kepala_bpbd",
  "masyarakat",
]);
export type RoleId = z.infer<typeof roleIdSchema>;

export const permissionResourceSchema = z.string().min(1);
export type PermissionResource = z.infer<typeof permissionResourceSchema>;

export const permissionActionsSchema = z.array(z.string()).default([]);
export type PermissionActions = z.infer<typeof permissionActionsSchema>;

export const rolePermissionRowSchema = z.object({
  id: z.string(),
  role: roleIdSchema,
  resource: permissionResourceSchema,
  actions: permissionActionsSchema,
});

export type RolePermissionRow = z.infer<typeof rolePermissionRowSchema>;

export const updateRolePermissionSchema = z.object({
  role: roleIdSchema,
  resource: permissionResourceSchema,
  actions: z.array(z.string()),
});

export type UpdateRolePermissionInput = z.infer<typeof updateRolePermissionSchema>;

