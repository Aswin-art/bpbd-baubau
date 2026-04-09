/**
 * Settings Module (Server)
 */

export { settingsService } from "./settings.service";
export {
  heroSlideSchema,
  heroSlideListParamsSchema,
  createHeroSlideSchema,
  updateHeroSlideSchema,
  reorderHeroSlidesSchema,
  siteSettingsSchema,
  updateSiteSettingsSchema,
} from "./settings.dto";
export type {
  HeroSlide,
  HeroSlideListParams,
  CreateHeroSlideInput,
  UpdateHeroSlideInput,
  ReorderHeroSlidesInput,
  SiteSettings,
  UpdateSiteSettingsInput,
} from "./settings.dto";

