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
      {/* Floating pill navbar (mobile + desktop) */}
      <nav className="fixed top-6 left-1/2 z-50 w-[85%] max-w-400 -translate-x-1/2 xl:w-[95%]">
        <div
          className={cn(
            "relative flex items-center justify-between rounded-2xl border shadow-sm backdrop-blur-md transition-all duration-500",
            "bg-background/80",
            isScrolled ? "border-border/20" : "border-border/10",
            "px-5 py-3 lg:px-6",
          )}
        >
          {/* Mobile logo (left) */}
          <Link href="/" className="flex xl:hidden items-center gap-4 group">
            <Image
              src="/logo-bpbd.avif"
              alt="BPBD Kota Baubau"
              width={160}
              height={160}
              className="h-12 w-auto object-contain"
              priority={false}
            />
          </Link>

          {/* Desktop logo (left) */}
          <Link href="/" className="hidden xl:flex items-center justify-start group">
            <Image
              src="/logo-bpbd.avif"
              alt="BPBD Kota Baubau"
              width={200}
              height={80}
              className="h-14 w-auto object-contain object-left transition-transform duration-300 lg:h-16"
              priority={false}
            />
          </Link>

          {/* Desktop menu (center) */}
          <div className="hidden xl:flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-0.5 gap-y-1 lg:gap-x-1">
            {publicNavItems.map((item) => {
              const active = navLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative z-50 flex items-center gap-1.5 px-2 py-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 xl:px-3 2xl:px-5",
                    active
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop login (right) */}
          <div className="hidden xl:flex shrink-0 items-center border-l border-border/10 pl-4 lg:pl-6">
            <Button
              asChild
              variant="default"
              size="sm"
              className={cn(
                "h-9 min-w-28 rounded-md px-4",
                "font-mono text-[11px] uppercase tracking-[0.22em]",
                "bg-primary text-primary-foreground",
                "hover:bg-black",
              )}
            >
              <Link href={session?.user ? "/dashboard/profiles" : "/sign-in"}>
                {session?.user ? "Dashboard" : "Login"}
              </Link>
            </Button>
          </div>

          {/* Mobile menu trigger (right) */}
          <div className="flex xl:hidden items-center">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Menu"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-border/30 bg-background/60 text-foreground shadow-sm backdrop-blur-md transition-all duration-500 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <div className="flex w-5 flex-col items-end gap-1.5">
                <span className="h-px w-full bg-current transition-all duration-300 ease-out" />
                <span className="h-px w-2/3 bg-current transition-all duration-300 ease-out group-hover:w-full" />
              </div>
            </button>
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
              className="fixed inset-0 z-60 flex flex-col justify-center overflow-hidden bg-black px-4 text-white md:px-12"
            >
              <div className="absolute top-0 left-0 flex w-full items-center justify-between border-b border-white/10 px-4 py-5 md:px-8 xl:px-12">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-black tracking-tighter text-white uppercase leading-none md:text-xl"
                >
                  BPBD <br className="hidden sm:block" />
                  Kota Baubau
                </Link>
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label="Tutup menu"
                  className="flex items-center gap-2 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:text-primary"
                >
                  <X size={24} aria-hidden />
                </button>
              </div>

              <nav className="mt-16 flex flex-col gap-4 sm:mt-20 sm:gap-6 md:gap-8">
                {publicNavItems.map((item) => (
                  <div key={item.href} className="overflow-hidden">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-[clamp(2rem,10vw,2.75rem)] leading-[0.85] font-black tracking-tighter text-white uppercase transition-colors hover:text-primary sm:text-5xl md:text-8xl lg:text-[7vw]"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </nav>

              <div className="absolute bottom-10 left-4 overflow-hidden md:left-12">
                <div className="flex flex-col gap-4">
                  <Link
                    href={session?.user ? "/dashboard/profiles" : "/sign-in"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-primary uppercase transition-colors hover:text-white sm:text-base"
                  >
                    {session?.user ? "Buka dashboard" : "Login"}{" "}
                    <ArrowRight size={20} aria-hidden />
                  </Link>

                  <a
                    href="tel:04022821110"
                    className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-primary uppercase transition-colors hover:text-white sm:text-base"
                  >
                    Hubungi posko darurat <ArrowRight size={20} aria-hidden />
                  </a>
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
