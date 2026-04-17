"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";

import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { PublicHeroSlide } from "@/modules/public/hero-slides";
import { getBaseUrl } from "@/lib/url";

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
  const res = await fetch(`${getBaseUrl()}/api/public/hero-slides`, {
    cache: "no-store",
  });
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

  const swiperRef = useRef<SwiperInstance | null>(null);

  const slides: UiHeroSlide[] = (data?.slides ?? []).map((s) => ({
    id: s.id,
    imageUrl: s.imageUrl,
    heading: s.title ?? "BPBD Kota Baubau",
    description: s.subtitle,
    cta: { href: s.linkUrl },
  }));
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = slides[activeIndex];

  if (slides.length === 0) {
    return (
      <section className="relative w-full pt-12 sm:pt-[56px]">
        <div className="mx-auto flex h-[calc(100svh-48px)] w-full flex-col px-1.5 py-4 sm:h-[calc(100svh-56px)] sm:px-2 sm:py-4 lg:px-3">
          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-3xl bg-black">
            <p className="text-white/60 text-lg">Belum ada slide hero.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full pt-12 sm:pt-[56px]">
      {/* Inset cinematic stage (not full-bleed), always one-screen tall */}
      <div className="mx-auto flex h-[calc(100svh-48px)] w-full flex-col px-1.5 py-4 sm:h-[calc(100svh-56px)] sm:px-2 sm:py-4 lg:px-3">
        <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-3xl bg-black ring-1 ring-white/10">
        {/* Grain + vignette + Swiss grid */}
        <div className="pointer-events-none absolute inset-0 z-20 opacity-25 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-60 brightness-100 contrast-150" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/10 to-black/80" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.18]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[72px_72px]" />
        </div>

        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1400}
          autoplay={{
            delay: 7000,
            disableOnInteraction: false,
          }}
          loop={slides.length > 1}
          allowTouchMove={slides.length > 1}
          onSwiper={(s) => {
            swiperRef.current = s;
          }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative h-full w-full">
              <div className="absolute inset-0">
                <motion.div
                  // “Cinematic drift” instead of ken-burns
                  initial={false}
                  animate={
                    activeIndex === index
                      ? { scale: 1.06, x: -10, y: 6 }
                      : { scale: 1.02, x: 0, y: 0 }
                  }
                  transition={{ duration: 7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full"
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.heading}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </motion.div>
              </div>
              <div className="absolute inset-0 bg-linear-to-tr from-black/55 via-black/10 to-black/35" />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Swiss composition: left-aligned typography, strict rhythm */}
        <div className="pointer-events-none absolute inset-0 z-30">
          <div className="flex h-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
            {/* Top meta row (aligns with navbar grid) */}
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-3 text-white/90">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(255,255,255,0.06)]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
                  Portal Kebencanaan
                </span>
              </div>
              <span className="hidden sm:inline font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-white/65">
                BPBD • Baubau
              </span>
            </div>

            {/* Bottom-left content */}
            <div className="flex items-end justify-between gap-6 pb-1">
              <div className="max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(10px)" }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 className="text-balance font-heading text-4xl font-black uppercase tracking-[-0.03em] text-white drop-shadow-[0_20px_70px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl">
                    {activeSlide?.heading}
                  </h2>
                  {activeSlide?.description ? (
                    <p className="mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
                      {activeSlide.description}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
                {activeSlide?.cta?.href ? (
                  <Button
                    asChild
                    size="lg"
                    className="group h-12 rounded-full bg-white/95 px-7 text-sm font-semibold text-black hover:bg-white"
                  >
                    <Link href={activeSlide.cta.href}>
                      Selengkapnya
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

              {slides.length > 1 ? (
                <div className="pointer-events-auto flex items-center">
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-1.5 py-1 text-white backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => swiperRef.current?.slidePrev()}
                      aria-label="Slide sebelumnya"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 px-1">
                      {slides.slice(0, 6).map((_, i) => {
                        const isActive = i === activeIndex;
                        return (
                          <span
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            className={
                              "h-1 w-1 rounded-full transition-colors " +
                              (isActive ? "bg-white" : "bg-white/35")
                            }
                            aria-hidden
                          />
                        );
                      })}
                      {slides.length > 6 ? (
                        <span className="ml-0.5 font-mono text-[10px] font-semibold tracking-[0.22em] text-white/70">
                          {activeIndex + 1}/{slides.length}
                        </span>
                      ) : (
                        <span className="ml-1 font-mono text-[10px] font-semibold tracking-[0.22em] text-white/70">
                          {activeIndex + 1}/{slides.length}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => swiperRef.current?.slideNext()}
                      aria-label="Slide berikutnya"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
