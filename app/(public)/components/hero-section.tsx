"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";

import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { PublicHeroSlide } from "@/modules/public/hero-slides";
import { getBaseUrl } from "@/lib/url";

import "swiper/css";
import "swiper/css/effect-fade";
import { cn } from "@/lib/utils";

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
      <section className="relative w-full pt-16 sm:pt-[76px]">
        <div className="relative h-[calc(92vh-4rem)] min-h-[640px] w-full overflow-hidden bg-black md:h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-white/60 text-lg">Belum ada slide hero.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full pt-16 sm:pt-[76px]">
      {/* Full-bleed cinematic stage */}
      <div className="relative h-[calc(92vh-4rem)] min-h-[680px] w-full overflow-hidden bg-black md:h-[calc(100vh-4rem)]">
        {/* Grain + vignette */}
        <div className="pointer-events-none absolute inset-0 z-20 opacity-25 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-60 brightness-100 contrast-150" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/10 to-black/70" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/60 via-black/20 to-transparent" />
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
          onSwiper={setSwiper}
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

        {/* New layout: centered title + bottom filmstrip */}
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col">
          {/* top meta row */}
          <div className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8 lg:px-14 lg:pt-10">
            <div className="flex items-center gap-3 text-white/90">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(255,255,255,0.06)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
                Portal Kebencanaan
              </span>
            </div>
            {slides.length > 1 ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-md">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            ) : null}
          </div>

          {/* center title block */}
          <div className="flex flex-1 items-center px-6 sm:px-10 lg:px-14">
            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(10px)" }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto max-w-5xl text-center"
                >
                  <h2 className="text-balance font-heading text-4xl font-black uppercase tracking-[-0.03em] text-white drop-shadow-[0_20px_70px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl">
                    {activeSlide?.heading}
                  </h2>
                  {activeSlide?.description ? (
                    <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                      {activeSlide.description}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
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

                {slides.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="group pointer-events-auto h-12 rounded-full border-white/20 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
                    onClick={() => swiper?.slideNext()}
                  >
                    Putar cerita
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* bottom filmstrip */}
          {slides.length > 1 ? (
            <div className="pointer-events-auto px-6 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10">
              <div className="flex items-center justify-between gap-4">
                <p className="hidden sm:block font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  Pilih frame
                </p>
                <div className="h-px flex-1 bg-white/10" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  Geser
                </p>
              </div>

              <div className="mt-4 flex w-full gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => swiper?.slideToLoop(idx)}
                    className={cn(
                      "group relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border transition-all sm:h-20 sm:w-36",
                      idx === activeIndex
                        ? "border-white/70 ring-2 ring-white/30"
                        : "border-white/15 opacity-80 hover:opacity-100 hover:border-white/35",
                    )}
                    aria-label={`Buka slide ${idx + 1}`}
                  >
                    <Image
                      src={slide.imageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-1 backdrop-blur">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
