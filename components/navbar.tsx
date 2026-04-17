"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { publicNavItems } from "@/data/dummy-data";
import { authClient } from "@/lib/auth-client";

const BPBD_CONTACT_PHONE = "04022821110";
const BPBD_CONTACT_EMAIL = "bpbd@baubaukota.go.id";
// Approx. Baubau center; adjust to exact BPBD office if needed.
const BPBD_MAP = { lat: -5.463, lng: 122.607, zoom: 15 };

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { data: session } = authClient.useSession();

  const toggleMenu = useCallback(() => {
    setIsMobileMenuOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const shrinkActive = isScrolled && isDesktop;

  const navLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50">
        <motion.div
          className="mx-auto w-full px-1.5 sm:px-2 lg:px-3"
          style={{ transformOrigin: "50% 0%" }}
          animate={{
            width: shrinkActive ? "80%" : "100%",
            y: shrinkActive ? 12 : 0,
          }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
         <motion.div
            className={cn(
              "relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isScrolled
                ? "overflow-hidden rounded-xl bg-white/40 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                : "bg-transparent border-transparent shadow-none"
            )}
            animate={{ borderRadius: shrinkActive ? 12 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                "relative grid min-h-16 grid-cols-12 items-center gap-x-4 px-2.5 py-3 sm:min-h-[76px] sm:px-3 sm:py-4 lg:px-4",
              )}
            >
              {/* Brand */}
              <div className="col-span-8 flex items-center gap-3 sm:col-span-6 lg:col-span-3">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/logo-bpbd.avif"
                    alt="BPBD Kota Baubau"
                    width={160}
                    height={64}
                    className={cn(
                      "h-10 w-auto object-contain sm:h-11",
                    )}
                    priority={false}
                  />
                  <span
                    className={cn(
                      "hidden sm:block font-mono text-[10px] font-semibold uppercase tracking-[0.35em]",
                      "text-zinc-950/70",
                    )}
                  >
                    BPBD Kota Baubau
                  </span>
                </Link>
              </div>

              {/* Right cluster (menu + login) */}
              <div className="col-span-4 hidden items-center justify-end gap-3 sm:col-span-6 lg:col-span-9 lg:flex">
                <nav className={cn("flex items-center whitespace-nowrap gap-7", shrinkActive && "hidden")}>
                  {publicNavItems.map((item) => {
                    const active = navLinkActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "py-2 font-heading text-sm font-semibold tracking-wide transition-colors",
                          active
                            ? "text-zinc-950"
                            : "text-zinc-500 hover:text-zinc-900",
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "inline-flex rounded-xl transition-all duration-300",
                    "bg-zinc-200 text-zinc-950 hover:bg-zinc-300",
                    "h-10 px-6",
                    "font-mono text-[10px] font-semibold uppercase tracking-[0.28em]",
                  )}
                >
                  <Link href={session?.user ? "/dashboard/profiles" : "/sign-in"}>
                    {session?.user ? "Dashboard" : "Login"}
                  </Link>
                </Button>

                {/* Mobile menu trigger */}
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label="Menu"
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-transparent transition-colors",
                    !shrinkActive && "lg:hidden",
                    isScrolled
                      ? "text-zinc-950 hover:bg-black/5"
                      : "text-zinc-950 hover:bg-black/5",
                  )}
                >
                  <div className="flex w-5 flex-col items-end gap-1.5">
                    <span className="h-px w-full bg-current" />
                    <span className="h-px w-2/3 bg-current" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </nav>

      {/* Fullscreen menu (used by hamburger, incl. shrink mode on desktop) */}
      <div>
        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              key="mobile-menu"
              className="fixed inset-0 z-60 flex flex-col overflow-hidden text-zinc-950"
              aria-hidden={!isMobileMenuOpen}
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.64, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              </div>

              <div className="absolute inset-0 bg-white text-zinc-950" />

              <div className="relative flex flex-1">
                {/* Swiss-inspired grid + typography */}
                <div className="relative mx-auto flex w-full max-w-7xl flex-1 px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-8">
                  <div className="grid min-h-0 w-full grid-cols-12 gap-x-8 gap-y-8">
                    {/* header row */}
                    <div className="col-span-12 flex items-center justify-between">
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3"
                      >
                        <Image
                          src="/logo-bpbd.avif"
                          alt="BPBD Kota Baubau"
                          width={160}
                          height={64}
                          className="h-9 w-auto object-contain sm:h-10"
                        />
                        <div className="leading-tight">
                          <div className="font-heading text-base font-semibold tracking-tight text-zinc-950 sm:text-lg">
                            BPBD Kota Baubau
                          </div>
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-950/60">
                            Menu
                          </div>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={toggleMenu}
                        aria-label="Tutup menu"
                        className="inline-flex items-center gap-2 border-b border-transparent py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-950/70 transition-colors hover:border-zinc-950/30 hover:text-zinc-950"
                      >
                        Tutup
                        <X size={16} aria-hidden />
                      </button>
                    </div>

                    {/* main */}
                    <div className="col-span-12 grid min-h-0 grid-cols-12 gap-x-8 gap-y-10">
                      {/* menu (focus) */}
                      <motion.div
                        className="col-span-12 min-h-0 lg:col-span-8"
                        variants={{
                          open: {
                            y: 0,
                            transition: {
                              duration: 0.52,
                              ease: [0.22, 1, 0.36, 1],
                              delay: 0.14,
                            },
                          },
                          closed: {
                            y: -10,
                            transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                          },
                        }}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        <div className="min-h-0 overflow-y-auto pb-10 lg:pb-0">
                          <nav className="grid gap-x-12 gap-y-1 md:grid-cols-2 md:gap-y-2">
                            {publicNavItems.map((item) => {
                              const active = navLinkActive(item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={cn(
                                    "group flex items-baseline justify-between gap-4 border-b border-black/10 py-4 sm:py-5",
                                    "transition-colors hover:border-black/25",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "font-heading text-3xl font-semibold tracking-tight sm:text-5xl",
                                      active ? "text-zinc-950" : "text-zinc-900/90",
                                    )}
                                  >
                                    {item.name}
                                  </span>
                                  {active ? (
                                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-950/55">
                                      Aktif
                                    </span>
                                  ) : null}
                                </Link>
                              );
                            })}
                          </nav>
                        </div>
                      </motion.div>

                      {/* info rail */}
                      <motion.aside
                        className="col-span-12 lg:col-span-4"
                        variants={{
                          open: {
                            y: 0,
                            transition: {
                              duration: 0.52,
                              ease: [0.22, 1, 0.36, 1],
                              delay: 0.22,
                            },
                          },
                          closed: {
                            y: -10,
                            transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                          },
                        }}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        <div className="grid gap-8 border-t border-black/10 pt-6 lg:border-t-0 lg:pt-0">
                          {/* map */}
                          <div className="grid gap-3">
                            <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.32em] text-zinc-950/60">
                              Lokasi BPBD
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                              <iframe
                                title="Peta lokasi BPBD Kota Baubau"
                                loading="lazy"
                                className="h-56 w-full sm:h-64 lg:h-72"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${BPBD_MAP.lat}%2C${BPBD_MAP.lng}&zoom=${BPBD_MAP.zoom}`}
                              />
                            </div>
                          </div>

                          {/* contact */}
                          <div className="grid gap-3">
                            <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.32em] text-zinc-950/60">
                              Kontak
                            </div>
                            <div className="grid gap-2">
                              <a
                                href={`tel:${BPBD_CONTACT_PHONE}`}
                                className="inline-flex items-center justify-between gap-4 border-b border-black/10 py-3 font-heading text-lg font-semibold tracking-tight text-zinc-950 transition-colors hover:border-black/25"
                              >
                                <span>Telepon posko</span>
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-950/55">
                                  {BPBD_CONTACT_PHONE}
                                </span>
                              </a>
                              <a
                                href={`mailto:${BPBD_CONTACT_EMAIL}`}
                                className="inline-flex items-center justify-between gap-4 border-b border-black/10 py-3 font-heading text-lg font-semibold tracking-tight text-zinc-950 transition-colors hover:border-black/25"
                              >
                                <span>Email</span>
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-950/55">
                                  {BPBD_CONTACT_EMAIL}
                                </span>
                              </a>
                            </div>
                          </div>

                          {/* login */}
                          <div className="grid gap-3">
                            <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.32em] text-zinc-950/60">
                              Akun
                            </div>
                            <Button
                              asChild
                              className="h-12 w-full rounded-full bg-zinc-950 text-white hover:bg-zinc-900"
                            >
                              <Link
                                href={session?.user ? "/dashboard/profiles" : "/sign-in"}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {session?.user ? "Buka dashboard" : "Login"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.aside>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navbar;