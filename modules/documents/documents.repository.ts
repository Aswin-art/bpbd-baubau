import db from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface DocumentListParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: "sop" | "regulasi" | "pedoman";
}

export interface DocumentListResult {
  documents: Prisma.DocumentGetPayload<{
    select: {
      id: true;
      name: true;
      description: true;
      category: true;
      dateLabel: true;
      fileSize: true;
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

const documentSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  dateLabel: true,
  fileSize: true,
  downloadUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const documentRepository = {
  async findMany(params: DocumentListParams = {}): Promise<DocumentListResult> {
    const { page = 1, limit = 10, q, category } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        select: documentSelect,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.document.count({ where }),
    ]);

    return {
      documents,
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async findById(id: string) {
    return db.document.findUnique({
      where: { id },
      select: documentSelect,
    });
  },

  async create(data: Prisma.DocumentCreateInput) {
    return db.document.create({
      data,
      select: documentSelect,
    });
  },

  async update(id: string, data: Prisma.DocumentUpdateInput) {
    return db.document.update({
      where: { id },
      data,
      select: documentSelect,
    });
  },

  async deleteMany(ids: string[]) {
    return db.document.deleteMany({ where: { id: { in: ids } } });
  },

  async delete(id: string) {
    return db.document.delete({ where: { id }, select: { id: true } });
  },

  async getStats() {
    const [total, sop, regulasi, pedoman] = await Promise.all([
      db.document.count(),
      db.document.count({ where: { category: "sop" } }),
      db.document.count({ where: { category: "regulasi" } }),
      db.document.count({ where: { category: "pedoman" } }),
    ]);

    return { total, sop, regulasi, pedoman };
  },
};

