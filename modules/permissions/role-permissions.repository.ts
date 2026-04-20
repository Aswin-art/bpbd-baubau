import db from "@/lib/db";

import type { RoleId } from "./role-permissions.dto";
import type { RolePermissionEntry } from "./role-permissions.dto";

function emptyPermissionsByRole(): Record<RoleId, RolePermissionEntry[]> {
  return {
    admin: [],
    operator: [],
    kepala_bpbd: [],
    masyarakat: [],
  };
}

function emptyUserCountByRole(): Record<RoleId, number> {
  return {
    admin: 0,
    operator: 0,
    kepala_bpbd: 0,
    masyarakat: 0,
  };
}

export const rolePermissionsRepository = {
  /**
   * Semua baris role_permission dikelompokkan per role (hanya RoleId aplikasi).
   */
  async getPermissionsGroupedByRole(): Promise<
    Record<RoleId, RolePermissionEntry[]>
  > {
    const rows = await db.rolePermission.findMany({
      select: { role: true, resource: true, actions: true },
      orderBy: [{ role: "asc" }, { resource: "asc" }],
    });

    const grouped = emptyPermissionsByRole();

    for (const row of rows) {
      if (String(row.resource).toLowerCase() === "user") continue;
      const actions = (row.actions as string[]) ?? [];
      if (actions.length === 0) continue;

      const roleId = String(row.role).toLowerCase() as RoleId;
      if (roleId in grouped) {
        grouped[roleId].push({
          resource: row.resource,
          actions,
        });
      }
    }


    return grouped;
  },

  /** Jumlah user per role (hanya RoleId aplikasi). */
  async countUsersByRole(): Promise<Record<RoleId, number>> {
    const result = emptyUserCountByRole();

    const counts = await db.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    });

    for (const c of counts) {
      const roleKey = String(c.role).toLowerCase() as RoleId;
      if (roleKey in result) {
        result[roleKey] = c._count._all;
      }
    }

    return result;
  },

  async listAll() {
    return db.rolePermission.findMany({
      select: {
        id: true,
        role: true,
        resource: true,
        actions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ role: "asc" }, { resource: "asc" }],
    });
  },

  async listByRole(role: string) {
    return db.rolePermission.findMany({
      where: { role },
      select: { resource: true, actions: true },
    });
  },

  async findByRoleResource(role: string, resource: string) {
    return db.rolePermission.findUnique({
      where: {
        role_resource: { role, resource },
      } as any,
    });
  },

  async updateActions(role: string, resource: string, actions: string[]) {
    return db.rolePermission.update({
      where: {
        role_resource: { role, resource },
      } as any,
      data: { actions },
      select: {
        id: true,
        role: true,
        resource: true,
        actions: true,
      },
    });
  },
};


