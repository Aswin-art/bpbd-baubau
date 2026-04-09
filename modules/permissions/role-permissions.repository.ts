import db from "@/lib/db";

export const rolePermissionsRepository = {
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


