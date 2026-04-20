import { AppError } from "@/lib/app-error";
import { rolePermissionsRepository } from "./role-permissions.repository";
import {
  dashboardRolesMeta,
  type DashboardRoleListItem,
  type UpdateRolePermissionInput,
} from "./role-permissions.dto";

export const rolePermissionsService = {
  async listAll() {
    return rolePermissionsRepository.listAll();
  },

  /**
   * Daftar role dashboard + jumlah user; opsional sertakan izin per role dari DB.
   */
  async listDashboardRoles(
    includePermissions: boolean,
  ): Promise<DashboardRoleListItem[]> {
    const [userCounts, permissionsByRole] = await Promise.all([
      rolePermissionsRepository.countUsersByRole(),
      includePermissions
        ? rolePermissionsRepository.getPermissionsGroupedByRole()
        : Promise.resolve(null),
    ]);

    return dashboardRolesMeta.map((meta) => ({
      id: meta.id,
      name: meta.name,
      description: meta.description,
      userCount: userCounts[meta.id] ?? 0,
      permissions:
        includePermissions && permissionsByRole
          ? (permissionsByRole[meta.id] ?? [])
          : [],
    }));
  },

  async getPermissionsMapByRole(role: string) {
    const rows = await rolePermissionsRepository.listByRole(role);
    const map: Record<string, string[]> = {};
    for (const r of rows) {
      map[r.resource] = (r.actions as string[]) ?? [];
    }
    return map;
  },

  async updateRolePermission(input: UpdateRolePermissionInput) {
    const existing = await rolePermissionsRepository.findByRoleResource(
      input.role,
      input.resource,
    );
    if (!existing) {
      // As requested: no adding new permission rows from UI/API.
      throw AppError.notFound(
        "Permission row not found (cannot create new permission rows from dashboard).",
        "ROLE_PERMISSION_NOT_FOUND",
      );
    }

    return rolePermissionsRepository.updateActions(
      input.role,
      input.resource,
      input.actions,
    );
  },
};


