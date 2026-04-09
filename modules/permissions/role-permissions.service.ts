import { AppError } from "@/lib/app-error";
import { rolePermissionsRepository } from "./role-permissions.repository";
import type { UpdateRolePermissionInput } from "./role-permissions.dto";

export const rolePermissionsService = {
  async listAll() {
    return rolePermissionsRepository.listAll();
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


