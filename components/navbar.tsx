"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { publicNavItems } from "@/data/dummy-data";
import { authClient } from "@/lib/auth-client";

const Navbar = () => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const navLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Cinematic navbar (matches hero mood) */}
      <nav className="fixed inset-x-0 top-0 z-50">
        <div className="w-full">
          <div
            className={cn(
              "relative w-full min-h-16 flex items-center justify-between border-b px-4 py-4 backdrop-blur-md transition-all duration-500 sm:min-h-[76px] sm:px-8 sm:py-5 lg:px-12",
              "text-zinc-950",
              isScrolled ? "border-black/10 bg-white/85" : "border-black/5 bg-white/70",
            )}
          >
            {/* subtle grain */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Brand */}
            <Link href="/" className="relative flex items-center gap-3">
              <Image
                src="/logo-bpbd.avif"
                alt="BPBD Kota Baubau"
                width={160}
                height={64}
                className="h-11 w-auto object-contain"
                priority={false}
              />
              <span className="hidden sm:block font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-950/70">
                BPBD Kota Baubau
              </span>
            </Link>

            {/* Desktop links */}
            <div className="relative hidden xl:flex items-center gap-7">
              {publicNavItems.map((item) => {
                const active = navLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative py-2 font-heading text-sm font-semibold tracking-wide transition-colors",
                      "text-zinc-950/70 hover:text-zinc-950",
                      "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary/60 after:transition-transform after:duration-300 after:content-['']",
                      "hover:after:scale-x-100",
                      active &&
                        "text-zinc-950 after:scale-x-100 after:bg-primary",
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="relative flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className={cn(
                  "hidden xl:inline-flex h-10 rounded-full px-6",
                  "bg-zinc-950 text-white hover:bg-zinc-900",
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-zinc-950 backdrop-blur-md transition-colors hover:bg-white xl:hidden"
              >
                <div className="flex w-5 flex-col items-end gap-1.5">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-2/3 bg-current" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile */}
      <div className="xl:hidden">
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-white text-zinc-950"
            >
              {/* subtle grain (same spirit as main nav, tuned for light bg) */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              </div>

              <div className="relative flex items-center justify-between border-b border-black/10 px-5 py-5">
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
                    className="h-10 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label="Tutup menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-zinc-100 text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  <X size={20} aria-hidden />
                </button>
              </div>

              <div className="relative flex flex-1 flex-col justify-between px-5 pb-8 pt-10">
                <nav className="grid gap-2">
                  {publicNavItems.map((item) => {
                    const active = navLinkActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "rounded-2xl border px-5 py-4 text-lg font-semibold tracking-tight transition-colors",
                          active
                            ? "border-primary/25 bg-primary/10 text-zinc-950"
                            : "border-black/10 bg-zinc-50/80 text-zinc-800 hover:border-black/15 hover:bg-zinc-100 hover:text-zinc-950",
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-10 grid gap-3">
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

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full rounded-full border-black/15 bg-transparent text-zinc-950 hover:bg-zinc-100 hover:text-zinc-950"
                  >
                    <a href="tel:04022821110">
                      Hubungi posko darurat
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navbar;
