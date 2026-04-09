import db from "@/lib/db";
import type { Prisma, ArticleStatus } from "@/generated/prisma/client";

export interface ArticleListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ArticleStatus;
  category?: string;
}

export interface ArticleListResult {
  articles: (Prisma.ArticleGetPayload<{
    select: {
      id: true;
      title: true;
      slug: true;
      content: true;
      excerpt: true;
      thumbnailUrl: true;
      category: true;
      status: true;
      publishedAt: true;
      authorId: true;
      createdAt: true;
      updatedAt: true;
      author: {
        select: {
          name: true;
        };
      };
    };
  }> & { authorName?: string })[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  thumbnailUrl: true,
  category: true,
  status: true,
  publishedAt: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      name: true,
    },
  },
} as const;

/**
 * Repository layer for Article entity.
 * ONLY layer allowed to touch the database.
 * @internal - Do not import directly from other modules
 */
export const articleRepository = {
  async findMany(params: ArticleListParams = {}): Promise<ArticleListResult> {
    const { page = 1, limit = 10, search, status, category } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(category && { category }),
    };

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        select: articleSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.article.count({ where }),
    ]);

    return {
      articles: articles.map((article) => ({
        ...article,
        authorName: article.author?.name,
      })),
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    const article = await db.article.findUnique({
      where: { id },
      select: articleSelect,
    });

    if (!article) return null;

    return {
      ...article,
      authorName: article.author?.name,
    };
  },

  async findBySlug(slug: string) {
    const article = await db.article.findUnique({
      where: { slug },
      select: articleSelect,
    });

    if (!article) return null;

    return {
      ...article,
      authorName: article.author?.name,
    };
  },

  async create(data: Prisma.ArticleCreateInput) {
    const article = await db.article.create({
      data,
      select: articleSelect,
    });

    return {
      ...article,
      authorName: article.author?.name,
    };
  },

  async update(id: string, data: Prisma.ArticleUpdateInput) {
    const article = await db.article.update({
      where: { id },
      data,
      select: articleSelect,
    });

    return {
      ...article,
      authorName: article.author?.name,
    };
  },

  async delete(id: string) {
    return db.article.delete({
      where: { id },
      select: { id: true },
    });
  },

  async updateMany(ids: string[], data: Prisma.ArticleUpdateInput) {
    return db.article.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data,
    });
  },

  async deleteMany(ids: string[]) {
    return db.article.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  },

  async countByStatus() {
    const counts = await db.article.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const total = await db.article.count();

    const stats = counts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 } as Record<ArticleStatus, number>,
    );

    return {
      total,
      published: stats.PUBLISHED,
      draft: stats.DRAFT,
      archived: stats.ARCHIVED,
    };
  },

  async getCategories() {
    const articles = await db.article.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return articles.map((a) => a.category);
  },
};

