import db from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface ArchiveListParams {
  page?: number;
  limit?: number;
  q?: string;
  year?: string;
}

export interface ArchiveListResult {
  archives: Prisma.ArsipDocumentGetPayload<{
    select: {
      id: true;
      name: true;
      description: true;
      dateLabel: true;
      fileSize: true;
      year: true;
      downloadUrl: true;
      createdAt: true;
      updatedAt: true;
    };
  }>[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

const archiveSelect = {
  id: true,
  name: true,
  description: true,
  dateLabel: true,
  fileSize: true,
  year: true,
  downloadUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Repository layer for ArsipDocument entity.
 * ONLY layer allowed to touch the database.
 */
export const archiveRepository = {
  async findMany(params: ArchiveListParams = {}): Promise<ArchiveListResult> {
    const { page = 1, limit = 10, q, year } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ArsipDocumentWhereInput = {
      ...(year ? { year } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              // description is stored as TEXT; keep simple search on name only
            ],
          }
        : {}),
    };

    const [archives, total] = await Promise.all([
      db.arsipDocument.findMany({
        where,
        select: archiveSelect,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.arsipDocument.count({ where }),
    ]);

    return {
      archives,
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async findById(id: string) {
    return db.arsipDocument.findUnique({
      where: { id },
      select: archiveSelect,
    });
  },

  async create(data: Prisma.ArsipDocumentCreateInput) {
    return db.arsipDocument.create({
      data,
      select: archiveSelect,
    });
  },

  async update(id: string, data: Prisma.ArsipDocumentUpdateInput) {
    return db.arsipDocument.update({
      where: { id },
      data,
      select: archiveSelect,
    });
  },

  async deleteMany(ids: string[]) {
    return db.arsipDocument.deleteMany({
      where: { id: { in: ids } },
    });
  },

  async delete(id: string) {
    return db.arsipDocument.delete({
      where: { id },
      select: { id: true },
    });
  },

  async getStats() {
    const [total, years] = await Promise.all([
      db.arsipDocument.count(),
      db.arsipDocument.findMany({
        select: { year: true },
        distinct: ["year"],
      }),
    ]);

    const yearsCount = years.length;

    const latest = await db.arsipDocument.findFirst({
      orderBy: [{ year: "desc" }],
      select: { year: true },
    });

    const latestYear = latest?.year ?? null;
    const latestYearCount = latestYear
      ? await db.arsipDocument.count({ where: { year: latestYear } })
      : 0;

    return {
      total,
      years: yearsCount,
      latestYear,
      latestYearCount,
    };
  },

  async getYears() {
    const years = await db.arsipDocument.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });
    return years.map((y) => y.year);
  },
};

