"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";

const SPLASH_MS = 1600;
const REVEAL_MS = 900;

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
      className="fixed inset-0 z-9999 overflow-hidden bg-background"
      initial={false}
      animate={
        phase === "reveal"
          ? { y: "-100%", borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }
          : { y: "0%", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
      }
      transition={{
        duration: phase === "reveal" ? REVEAL_MS / 1000 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (phase === "reveal") {
          unlockScroll();
          setShouldRender(false);
        }
      }}
    >
      {/* Swiss grid + subtle grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.55]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      <div className="relative flex h-full w-full items-center justify-center px-6">
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: phase === "reveal" ? 0.985 : 1,
            filter: phase === "reveal" ? "blur(2px)" : "blur(0px)",
          }}
          transition={{
            duration: phase === "reveal" ? 0.55 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="grid grid-cols-12 items-center gap-y-10">
            {/* left: identity */}
            <div className="col-span-12 md:col-span-7">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Portal Informasi &amp; Kesiapsiagaan Bencana
              </p>
              <h1 className="mt-4 text-balance font-heading text-4xl font-black uppercase tracking-[-0.03em] text-secondary sm:text-6xl">
                BPBD Kota Baubau
              </h1>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px w-16 bg-border" aria-hidden />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Siaga • Tanggap • Pulih
                </p>
              </div>
            </div>

            {/* right: mark */}
            <div className="col-span-12 md:col-span-5 md:justify-self-end">
              <div className="flex items-center gap-6 md:flex-col md:items-end md:gap-4">
                <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                  <Image
                    src="/logo-bpbd.avif"
                    alt="BPBD Kota Baubau"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="w-full md:w-64">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Memuat
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {String(Math.round((SPLASH_MS / (SPLASH_MS + REVEAL_MS)) * 100)).padStart(2, "0")}
                      %
                    </span>
                  </div>
                  <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-border">
                    <motion.div
                      className="h-full w-full origin-left bg-secondary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: phase === "reveal" ? 1 : 0.92 }}
                      transition={{
                        duration: phase === "reveal" ? 0.25 : SPLASH_MS / 1000,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
