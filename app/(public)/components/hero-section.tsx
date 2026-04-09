"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";

import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { PublicHeroSlide } from "@/modules/public/hero-slides";

import "swiper/css";
import "swiper/css/effect-fade";

type UiHeroSlide = {
  id: string;
  imageUrl: string;
  heading: string;
  description?: string | null;
  cta?: { href?: string | null };
};

async function fetchHeroSlides(): Promise<{ slides: PublicHeroSlide[] }> {
  const res = await fetch("/api/public/hero-slides", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch hero slides");
  }
  return res.json();
}

export function Jumbotron() {
  const { data } = useSuspenseQuery({
    queryKey: ["public-hero-slides"],
    queryFn: fetchHeroSlides,
  });

  const slides: UiHeroSlide[] = (data?.slides ?? []).map((s) => ({
    id: s.id,
    imageUrl: s.imageUrl,
    heading: s.title ?? "BPBD Kota Baubau",
    description: s.subtitle,
    cta: { href: s.linkUrl },
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  const activeSlide = slides[activeIndex];

  if (slides.length === 0) {
    return (
      <section className="relative flex h-screen md:h-[calc(100vh-1rem)] w-full items-center justify-center md:px-4 md:pt-4">
        <div className="relative h-full w-full overflow-hidden md:rounded-[2rem] bg-black flex items-center justify-center">
          <p className="text-white/60 text-lg">Belum ada slide hero.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex h-screen md:h-[calc(100vh-1rem)] w-full items-center justify-center md:px-4 md:pt-4">
      <div className="relative h-full w-full overflow-hidden md:rounded-[2rem] bg-black">
        {/* Grain Overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 opacity-15 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 brightness-100 contrast-150"></div>
        </div>

        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1500}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
          }}
          loop={slides.length > 1}
          allowTouchMove={false}
          onSwiper={setSwiper}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative h-full w-full">
              <div className="absolute inset-0 h-full w-full overflow-hidden">
                <div
                  className={`h-full w-full ${
                    activeIndex === index ? "animate-ken-burns" : ""
                  }`}
                >
                  {slide.imageUrl ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.heading}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  ) : null}
                </div>
              </div>
              {/* Enhanced gradient for better text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/20" />
              <div className="hidden md:block absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent" />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Minimal Content Layout */}
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end p-8 sm:p-12 lg:p-20">
          <div className="flex items-end justify-between gap-8">
            {/* Left: Title & Description */}
            <div className="flex max-w-3xl flex-col gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-4"
                >
                  {/* Title */}
                  <h2 className="font-heading text-5xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
                    {activeSlide?.heading}
                  </h2>

                  {/* Subtitle */}
                  {activeSlide?.description ? (
                    <p className="max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-md">
                      {activeSlide.description}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* CTA Button */}
              {activeSlide?.cta.href ? (
                <div className="pointer-events-auto">
                  <Button
                    asChild
                    size="lg"
                    className="group h-14 rounded-full bg-primary px-10 text-base font-medium text-white hover:bg-primary/90"
                  >
                    <Link href={activeSlide.cta.href}>
                      Selengkapnya
                      <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Right: Slide Navigation */}
            {slides.length > 1 ? (
              <div className="pointer-events-auto hidden flex-col items-end gap-4 rounded-xl bg-black/30 p-4 backdrop-blur-md sm:flex">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => swiper?.slideToLoop(idx)}
                    className={`group cursor-pointer flex items-center gap-4 transition-all duration-300 ${
                      activeIndex === idx
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <span
                      className={`font-mono text-base font-bold drop-shadow-lg transition-colors ${activeIndex === idx ? "text-primary" : "text-white"}`}
                    >
                      0{idx + 1}
                    </span>
                    <div
                      className={`h-0.5 transition-all duration-300 ${activeIndex === idx ? "w-12 bg-primary" : "w-6 bg-white/70 group-hover:w-8"}`}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
