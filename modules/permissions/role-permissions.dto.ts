import { z } from "zod";

export const roleIdSchema = z.enum([
  "admin",
  "operator",
  "kepala_bpbd",
  "masyarakat",
]);
export type RoleId = z.infer<typeof roleIdSchema>;

/** Meta role dashboard (urutan tampilan daftar izin). */
export const dashboardRolesMeta = [
  {
    id: "admin" as const,
    name: "Admin",
    description:
      "Akses penuh untuk mengelola seluruh modul dan pengaturan sistem.",
  },
  {
    id: "operator" as const,
    name: "Operator",
    description:
      "Operasional harian: kelola konten (artikel, dokumen, arsip, peta) dan data aspirasi.",
  },
  {
    id: "kepala_bpbd" as const,
    name: "Kepala BPBD",
    description:
      "Akses baca untuk monitoring dan publikasi; dapat mengubah status aspirasi.",
  },
  {
    id: "masyarakat" as const,
    name: "Masyarakat",
    description:
      "Pengguna portal: akses baca konten publik dan pengajuan aspirasi.",
  },
] as const satisfies ReadonlyArray<{ id: RoleId; name: string; description: string }>;

export type RolePermissionEntry = {
  resource: string;
  actions: string[];
};

export type DashboardRoleListItem = {
  id: RoleId;
  name: string;
  description: string;
  userCount: number;
  permissions: RolePermissionEntry[];
};

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

