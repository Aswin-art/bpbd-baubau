import db from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const usersRepository = {
  async list(params: {
    page: number;
    limit: number;
    q?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { page, limit, q, role, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async setActive(id: string, isActive: boolean) {
    return db.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true, updatedAt: true },
    });
  },

  async updateFields(
    id: string,
    data: { name?: string; role?: string; isActive?: boolean },
  ) {
    return db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, role: true, isActive: true, updatedAt: true },
    });
  },

  async setActiveMany(ids: string[], isActive: boolean) {
    return db.user.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
  },

  async deleteMany(ids: string[]) {
    return db.user.deleteMany({
      where: { id: { in: ids } },
    });
  },

  async delete(id: string) {
    return db.user.delete({
      where: { id },
      select: { id: true },
    });
  },
};


