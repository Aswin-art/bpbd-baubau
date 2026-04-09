import db from "@/lib/db";

export const publicNewsRepository = {
  async listLatest(limit: number) {
    const take = Math.max(1, Math.min(limit, 20));

    return db.article.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnailUrl: true,
        category: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take,
    });
  },
};

