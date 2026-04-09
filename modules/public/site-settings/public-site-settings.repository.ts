import db from "@/lib/db";

export const publicSiteSettingsRepository = {
  async getSingleton() {
    return db.siteSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
      select: {
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
      },
    });
  },
};

