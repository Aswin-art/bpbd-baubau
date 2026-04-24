import { cache } from "react";
import { publicSiteSettingsService } from "@/modules/public/site-settings";

/**
 * Deduplicate site settings reads within one request (RSC + layout + Server Components).
 */
export const getPublicSiteSettings = cache(() =>
  publicSiteSettingsService.getSettings(),
);
