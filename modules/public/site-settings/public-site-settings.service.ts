import { publicSiteSettingsRepository } from "./public-site-settings.repository";

export const publicSiteSettingsService = {
  async getSettings() {
    const settings = await publicSiteSettingsRepository.getSingleton();
    return { settings };
  },
};

