import db from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const heroSlideSelect = {
  id: true,
  sortOrder: true,
  imageUrl: true,
  title: true,
  subtitle: true,
  linkUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const siteSettingsSelect = {
  id: true,
  aboutDescription: true,
  objectives: true,
  goals: true,
  structurePhotoUrl: true,
  officePhotoUrl: true,
  mapEmbedUrl: true,
  contactEmail: true,
  contactPhone: true,
  socialInstagram: true,
  socialX: true,
  socialTiktok: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const settingsRepository = {
  // ----------------------
  // HeroSlide
  // ----------------------
  async listHeroSlides(includeInactive = true) {
    return db.heroSlide.findMany({
      where: includeInactive ? {} : { isActive: true },
      select: heroSlideSelect,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
  },

  async createHeroSlide(data: Prisma.HeroSlideCreateInput) {
    return db.heroSlide.create({ data, select: heroSlideSelect });
  },

  async updateHeroSlide(id: string, data: Prisma.HeroSlideUpdateInput) {
    return db.heroSlide.update({ where: { id }, data, select: heroSlideSelect });
  },

  async deleteHeroSlide(id: string) {
    return db.heroSlide.delete({ where: { id }, select: { id: true } });
  },

  async getHeroSlideMaxSortOrder() {
    const row = await db.heroSlide.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    return row?.sortOrder ?? 0;
  },

  async reorderHeroSlides(idsInOrder: string[]) {
    await db.$transaction(
      idsInOrder.map((id, idx) =>
        db.heroSlide.update({
          where: { id },
          data: { sortOrder: idx },
          select: { id: true },
        }),
      ),
    );
    return this.listHeroSlides(true);
  },

  // ----------------------
  // SiteSettings (singleton)
  // ----------------------
  async getSiteSettings() {
    return db.siteSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
      select: siteSettingsSelect,
    });
  },

  async updateSiteSettings(data: Prisma.SiteSettingsUpdateInput) {
    return db.siteSettings.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...(data as any),
      },
      select: siteSettingsSelect,
    });
  },
};

