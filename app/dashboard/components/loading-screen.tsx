"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Initial states
      gsap.set(containerRef.current, { opacity: 0 });
      gsap.set(logoRef.current, { y: 14, opacity: 0, scale: 0.98 });
      gsap.set(captionRef.current, { y: 8, opacity: 0 });
      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left" });

      // Sequence
      tl.to(containerRef.current, { opacity: 1, duration: 0.25 })
        .to(logoRef.current, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
        })
        .to(
          captionRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.35",
        )
        .to(
          progressRef.current,
          {
            scaleX: 1,
            duration: 1.1,
            ease: "expo.inOut",
          },
          "-=0.45",
        );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center overflow-hidden bg-background text-foreground"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-background to-muted/40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <div ref={logoRef} className="relative">
          <Image
            src="/logo-bpbd.avif"
            alt="Logo BPBD"
            width={320}
            height={320}
            className="h-20 w-auto object-contain drop-shadow-sm"
            priority
          />
        </div>

        <div ref={captionRef} className="text-center space-y-1">
          <p className="text-sm font-medium tracking-wide text-foreground">
            Memuat dashboard
          </p>
          <p className="text-xs text-muted-foreground">
            Mohon tunggu sebentar…
          </p>
        </div>

        {/* Progress */}
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div
            ref={progressRef}
            className="absolute inset-0 h-full w-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
