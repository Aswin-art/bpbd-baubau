import { publicNewsRepository } from "./public-news.repository";

export const publicNewsService = {
  async listLatest(params: { limit?: number } = {}) {
    const items = await publicNewsRepository.listLatest(params.limit ?? 5);

    return {
      items: items.map((it) => ({
        id: it.id,
        title: it.title,
        slug: it.slug,
        excerpt: it.excerpt,
        thumbnailUrl: it.thumbnailUrl,
        category: it.category,
        publishedAt: it.publishedAt ? it.publishedAt.toISOString() : null,
      })),
    };
  },
};

