"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";

const SPLASH_MS = 1200;
const REVEAL_MS = 600;

export default function SplashScreen() {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowSplash, setShouldShowSplash] = useState(false);
  const [phase, setPhase] = useState<"enter" | "reveal">("enter");
  const [shouldRender, setShouldRender] = useState(true);

  const unlockScroll = useCallback(() => {
    const layoutEl = document.getElementById("public-layout");
    if (layoutEl) {
      layoutEl.classList.remove("loading-state");
    }
  }, []);

  /** Kunci scroll dokumen selama splash tampil (termasuk fase cek & animasi keluar). */
  useEffect(() => {
    if (!shouldRender) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;
    const prevTouchAction = body.style.touchAction;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevOverscroll;
      body.style.touchAction = prevTouchAction;
    };
  }, [shouldRender]);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splash-shown");
    if (splashShown) {
      unlockScroll();
      setShouldRender(false);
      setIsChecking(false);
    } else {
      setShouldShowSplash(true);
      setIsChecking(false);
    }
  }, [unlockScroll]);

  useEffect(() => {
    if (!shouldRender && !isChecking) {
      unlockScroll();
    }
  }, [shouldRender, isChecking, unlockScroll]);

  useEffect(() => {
    if (!shouldShowSplash) return;
    const timer = setTimeout(() => {
      setPhase("reveal");
      sessionStorage.setItem("splash-shown", "true");
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [shouldShowSplash]);

  if (!shouldRender) return null;

  if (isChecking) {
    return <div className="fixed inset-0 z-9999 bg-background" aria-hidden />;
  }

  return (
    <motion.div
      className="fixed inset-0 z-9999 overflow-hidden bg-background flex flex-col items-center justify-center"
      initial={false}
      animate={
        phase === "reveal"
          ? { y: "-100%" }
          : { y: "0%" }
      }
      transition={{
        duration: phase === "reveal" ? REVEAL_MS / 1000 : 0,
        ease: [0.76, 0, 0.24, 1], // Snappy brutalist ease
      }}
      onAnimationComplete={() => {
        if (phase === "reveal") {
          unlockScroll();
          setShouldRender(false);
        }
      }}
    >
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: phase === "reveal" ? 0 : 1,
          scale: phase === "reveal" ? 0.95 : 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
      >
        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
          <Image
            src="/logo-bpbd.avif"
            alt="BPBD Kota Baubau"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight text-secondary">
            BPBD Kota Baubau
          </h1>
          <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
            Siaga • Tanggap • Pulih
          </p>
        </div>

        <div className="mt-4 w-48 border-2 border-border bg-muted p-1">
          <motion.div
            className="h-2 w-full origin-left bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === "reveal" ? 1 : 0.9 }}
            transition={{
              duration: phase === "reveal" ? 0.2 : SPLASH_MS / 1000,
              ease: "linear",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
