"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";

const SPLASH_MS = 1600;

export default function SplashScreen() {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowSplash, setShouldShowSplash] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
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
      setIsVisible(false);
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
      className={`fixed inset-0 z-9999 flex items-center justify-center overflow-hidden bg-background ${
        !isVisible ? "pointer-events-none" : ""
      }`}
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
      onAnimationComplete={() => {
        if (!isVisible) {
          setShouldRender(false);
        }
      }}
    >
      <motion.div
        className="flex flex-col items-center justify-center gap-8 px-8 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40">
          <Image
            src="/logo-bpbd.avif"
            alt="BPBD Kota Baubau"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-secondary sm:text-2xl">
            BPBD Kota Baubau
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Badan Penanggulangan Bencana Daerah
          </p>
        </div>

        <div className="h-px w-12 bg-border" aria-hidden />
      </motion.div>
    </motion.div>
  );
}
