import { publicHeroSlidesRepository } from "./public-hero-slides.repository";

export const publicHeroSlidesService = {
  async getSlides() {
    const slides = await publicHeroSlidesRepository.listActive();
    return { slides };
  },
};

