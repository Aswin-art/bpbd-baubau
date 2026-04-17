import { revalidateTag } from "next/cache";
import { AppError } from "@/lib/app-error";
import { sanitizeCommentHtml } from "@/lib/comment-html";
import { parseRole, isStaffRole } from "@/lib/rbac";
import { articleRepository } from "./articles.repository";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  ArticleListParams,
} from "./articles.dto";

// Helper to invalidate cache
const revalidateArticleCache = (slug?: string) => {
  revalidateTag("public-articles", "max");
  if (slug) {
    revalidateTag(`article:${slug}`, "max");
  }
};

export const articleService = {
  async list(params: ArticleListParams) {
    return articleRepository.findMany(params);
  },

  async getById(id: string) {
    const article = await articleRepository.findById(id);

    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    return article;
  },

  async create(input: CreateArticleInput, authorId: string) {
    // Check if slug already exists
    const existing = await articleRepository.findBySlug(input.slug);
    if (existing) {
      throw AppError.conflict("Slug already in use", "SLUG_EXISTS");
    }

    const status = input.status || "DRAFT";
    const publishedAt = status === "PUBLISHED" ? new Date() : null;

    const article = await articleRepository.create({
      title: input.title,
      slug: input.slug,
      content: input.content,
      excerpt: input.excerpt || null,
      thumbnailUrl: input.thumbnailUrl || null,
      category: input.category,
      status,
      publishedAt,
      author: {
        connect: { id: authorId },
      },
    });

    revalidateArticleCache(article.slug);
    return article;
  },

  async update(id: string, input: UpdateArticleInput) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    // Check if new slug already exists (if changing)
    if (input.slug && input.slug !== article.slug) {
      const existing = await articleRepository.findBySlug(input.slug);
      if (existing) {
        throw AppError.conflict("Slug already in use", "SLUG_EXISTS");
      }
    }

    // Auto-set publishedAt when status changes to PUBLISHED
    let publishedAt = undefined;
    if (
      (input.status === "PUBLISHED" && article.status !== "PUBLISHED") ||
      (input.status === "PUBLISHED" && !article.publishedAt)
    ) {
      publishedAt = new Date();
    }

    const updatedArticle = await articleRepository.update(id, {
      ...(input.title && { title: input.title }),
      ...(input.slug && { slug: input.slug }),
      ...(input.content && { content: input.content }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt || null }),
      ...(input.thumbnailUrl !== undefined && {
        thumbnailUrl: input.thumbnailUrl || null,
      }),
      ...(input.category && { category: input.category }),
      ...(input.status && { status: input.status }),
      ...(publishedAt && { publishedAt }),
    });

    revalidateArticleCache(article.slug); // Invalidate old slug
    if (updatedArticle.slug !== article.slug) {
      revalidateArticleCache(updatedArticle.slug); // Invalidate new slug
    }

    return updatedArticle;
  },

  async delete(id: string) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    await articleRepository.delete(id);
    revalidateArticleCache(article.slug);
    return { deleted: true };
  },

  async publish(id: string) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    const updated = await articleRepository.update(id, {
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    revalidateArticleCache(article.slug);
    return updated;
  },

  async archive(id: string) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    const updated = await articleRepository.update(id, {
      status: "ARCHIVED",
    });

    revalidateArticleCache(article.slug);
    return updated;
  },

  async unpublish(id: string) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    const updated = await articleRepository.update(id, {
      status: "DRAFT",
      publishedAt: null,
    });

    revalidateArticleCache(article.slug);
    return updated;
  },

  async bulkPublish(ids: string[]) {
    await articleRepository.updateMany(ids, {
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    revalidateArticleCache();
    return { count: ids.length };
  },

  async bulkArchive(ids: string[]) {
    await articleRepository.updateMany(ids, {
      status: "ARCHIVED",
    });
    revalidateArticleCache();
    return { count: ids.length };
  },

  async bulkDelete(ids: string[]) {
    await articleRepository.deleteMany(ids);
    revalidateArticleCache();
    return { count: ids.length };
  },

  async getStats() {
    return articleRepository.countByStatus();
  },

  async getCategories() {
    return articleRepository.getCategories();
  },

  async listComments(articleId: string) {
    const article = await articleRepository.findById(articleId);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }
    return articleRepository.findCommentsByArticleId(articleId);
  },

  async deleteComment(articleId: string, commentId: string) {
    const article = await articleRepository.findById(articleId);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    const result = await articleRepository.deleteComment(articleId, commentId);
    if (!result) {
      throw AppError.notFound("Comment not found", "COMMENT_NOT_FOUND");
    }

    revalidateArticleCache(article.slug);
    return { deleted: true as const };
  },

  async replyComment(params: {
    articleId: string;
    parentCommentId: string;
    user: { id: string; role?: string | null; name?: string | null; email?: string | null };
    bodyHtml: string;
  }) {
    const article = await articleRepository.findById(params.articleId);
    if (!article) {
      throw AppError.notFound("Article not found", "ARTICLE_NOT_FOUND");
    }

    const comments = await articleRepository.findCommentsByArticleId(params.articleId);
    const parent = comments.find((c) => c.id === params.parentCommentId);
    if (!parent) {
      throw AppError.notFound("Comment not found", "COMMENT_NOT_FOUND");
    }

    const role = parseRole(params.user as any);
    const isAdmin = isStaffRole(role);

    const sanitized = sanitizeCommentHtml(params.bodyHtml);
    if (!sanitized || sanitized.trim() === "") {
      throw AppError.badRequest("Komentar kosong", "EMPTY_COMMENT");
    }

    const authorName = String(params.user.name || params.user.email || "Admin");

    const created = await articleRepository.createComment({
      articleId: params.articleId,
      userId: params.user.id,
      authorName,
      bodyHtml: sanitized,
      isAdmin,
      parentId: params.parentCommentId,
    });

    revalidateArticleCache(article.slug);
    return created;
  },
};


