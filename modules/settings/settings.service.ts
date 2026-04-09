import { AppError } from "@/lib/app-error";
import { settingsRepository } from "./settings.repository";
import type {
  CreateHeroSlideInput,
  HeroSlideListParams,
  ReorderHeroSlidesInput,
  UpdateHeroSlideInput,
  UpdateSiteSettingsInput,
} from "./settings.dto";

export const settingsService = {
  // ----------------------
  // HeroSlide
  // ----------------------
  async listHeroSlides(params: HeroSlideListParams = {}) {
    const includeInactive = params.includeInactive ?? true;
    return settingsRepository.listHeroSlides(includeInactive);
  },

  async createHeroSlide(input: CreateHeroSlideInput) {
    const max = await settingsRepository.getHeroSlideMaxSortOrder();
    const sortOrder = input.sortOrder ?? max + 1;
    return settingsRepository.createHeroSlide({
      sortOrder,
      imageUrl: input.imageUrl,
      title: input.title ?? null,
      subtitle: input.subtitle ?? null,
      linkUrl: input.linkUrl ?? null,
      isActive: input.isActive,
    } as any);
  },

  async updateHeroSlide(id: string, input: UpdateHeroSlideInput) {
    return settingsRepository.updateHeroSlide(id, {
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
      ...(input.linkUrl !== undefined ? { linkUrl: input.linkUrl } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
  },

  async deleteHeroSlide(id: string) {
    return settingsRepository.deleteHeroSlide(id);
  },

  async reorderHeroSlides(input: ReorderHeroSlidesInput) {
    if (input.ids.length === 0) {
      throw AppError.badRequest("No ids provided", "NO_IDS");
    }
    return settingsRepository.reorderHeroSlides(input.ids);
  },

  // ----------------------
  // SiteSettings
  // ----------------------
  async getSiteSettings() {
    return settingsRepository.getSiteSettings();
  },

  async updateSiteSettings(input: UpdateSiteSettingsInput) {
    return settingsRepository.updateSiteSettings({
      ...(input.aboutDescription !== undefined
        ? { aboutDescription: input.aboutDescription as any }
        : {}),
      ...(input.aboutProfileUrl !== undefined
        ? { aboutProfileUrl: input.aboutProfileUrl }
        : {}),
      ...(input.contactEmail !== undefined
        ? { contactEmail: input.contactEmail }
        : {}),
      ...(input.contactPhone !== undefined
        ? { contactPhone: input.contactPhone }
        : {}),
      ...(input.socialInstagram !== undefined
        ? { socialInstagram: input.socialInstagram }
        : {}),
      ...(input.socialX !== undefined ? { socialX: input.socialX } : {}),
      ...(input.socialTiktok !== undefined
        ? { socialTiktok: input.socialTiktok }
        : {}),
    });
  },
};


