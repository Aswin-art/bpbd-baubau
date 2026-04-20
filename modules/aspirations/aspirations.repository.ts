import db from "@/lib/db";
import type { Prisma, AspirationStatus } from "@/generated/prisma/client";

export interface AspirationListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: AspirationStatus;
  /** Jika diisi, hanya baris milik pengguna ini (portal masyarakat). */
  userId?: string;
}

export interface AspirationListResult {
  aspirations: Prisma.AspirationGetPayload<{
    select: {
      id: true;
      submitterName: true;
      description: true;
      status: true;
      adminReply: true;
      repliedAt: true;
      repliedById: true;
      userId: true;
      createdAt: true;
      updatedAt: true;
    };
  }>[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

const aspirationSelect = {
  id: true,
  submitterName: true,
  description: true,
  status: true,
  adminReply: true,
  repliedAt: true,
  repliedById: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Repository layer for Aspiration entity.
 * ONLY layer allowed to touch the database.
 */
export const aspirationRepository = {
  async findMany(
    params: AspirationListParams = {},
  ): Promise<AspirationListResult> {
    const { page = 1, limit = 10, q, status, userId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AspirationWhereInput = {
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { submitterName: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [aspirations, total] = await Promise.all([
      db.aspiration.findMany({
        where,
        select: aspirationSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.aspiration.count({ where }),
    ]);

    return {
      aspirations,
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async findById(id: string) {
    return db.aspiration.findUnique({
      where: { id },
      select: aspirationSelect,
    });
  },

  async findByIdAndUserId(id: string, userId: string) {
    return db.aspiration.findFirst({
      where: { id, userId },
      select: aspirationSelect,
    });
  },

  async create(data: Prisma.AspirationCreateInput) {
    return db.aspiration.create({
      data,
      select: aspirationSelect,
    });
  },

  async update(id: string, data: Prisma.AspirationUpdateInput) {
    return db.aspiration.update({
      where: { id },
      data,
      select: aspirationSelect,
    });
  },

  async updateManyStatus(ids: string[], status: AspirationStatus) {
    return db.aspiration.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  },

  async updateStatus(id: string, status: AspirationStatus) {
    return db.aspiration.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
  },

  async deleteMany(ids: string[]) {
    return db.aspiration.deleteMany({
      where: { id: { in: ids } },
    });
  },

  async delete(id: string) {
    return db.aspiration.delete({
      where: { id },
      select: { id: true },
    });
  },

  async getStats() {
    const [total, pending, inProgress, completed, rejected] = await Promise.all([
      db.aspiration.count(),
      db.aspiration.count({ where: { status: "pending" } }),
      db.aspiration.count({ where: { status: "in_progress" } }),
      db.aspiration.count({ where: { status: "completed" } }),
      db.aspiration.count({ where: { status: "rejected" } }),
    ]);

    return {
      total,
      pending,
      in_progress: inProgress,
      completed,
      rejected,
    };
  },

  async getStatsForUser(userId: string) {
    const base: Prisma.AspirationWhereInput = { userId };
    const [total, pending, inProgress, completed, rejected] = await Promise.all([
      db.aspiration.count({ where: base }),
      db.aspiration.count({ where: { ...base, status: "pending" } }),
      db.aspiration.count({ where: { ...base, status: "in_progress" } }),
      db.aspiration.count({ where: { ...base, status: "completed" } }),
      db.aspiration.count({ where: { ...base, status: "rejected" } }),
    ]);

    return {
      total,
      pending,
      in_progress: inProgress,
      completed,
      rejected,
    };
  },
};

