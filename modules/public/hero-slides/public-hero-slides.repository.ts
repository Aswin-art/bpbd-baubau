import db from "@/lib/db";

export const publicHeroSlidesRepository = {
  async listActive() {
    return db.heroSlide.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sortOrder: true,
        imageUrl: true,
        title: true,
        subtitle: true,
        linkUrl: true,
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }],
    });
  },
};

