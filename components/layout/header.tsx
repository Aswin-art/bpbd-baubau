"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { MobileMenu } from "./mobile-menu";

const navigation = [
  { name: "Beranda", href: "/" },
  { name: "Berita", href: "/articles" },
  { name: "Dokumen & SOP", href: "/documents" },
  { name: "Aspirasi", href: "/aspirations" },
  { name: "Arsip Bencana", href: "/archives" },
];

function MenuToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl lg:hidden focus:outline-none group"
      aria-label={isOpen ? "Tutup menu" : "Buka menu"}
    >
      <div className="flex h-5 w-5 flex-col items-end justify-center gap-[5px]">
        <span
          className={cn(
            "block h-[2px] rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]",
            isOpen
              ? "w-5 translate-y-[7px] rotate-45 bg-primary"
              : "w-5 group-hover:bg-primary"
          )}
        />
        <span
          className={cn(
            "block h-[2px] rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]",
            isOpen
              ? "w-0 opacity-0"
              : "w-3.5 group-hover:w-5 group-hover:bg-primary"
          )}
        />
        <span
          className={cn(
            "block h-[2px] rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]",
            isOpen
              ? "w-5 -translate-y-[7px] -rotate-45 bg-primary"
              : "w-4 group-hover:w-5 group-hover:bg-primary"
          )}
        />
      </div>
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)] border-b border-black/[0.04]"
            : "bg-transparent"
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-primary via-primary to-primary/40" />

        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo-bpbd.avif"
              alt="Logo BPBD Kota Baubau"
              width={36}
              height={36}
              className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-[1.06]"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-[13px] font-extrabold tracking-tight text-secondary leading-none">
                BPBD
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase mt-[2px]">
                Kota Baubau
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-0.5 rounded-md bg-muted/60 p-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200",
                      isActive
                        ? "text-primary-foreground bg-secondary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="tel:04022821110"
              className="hidden md:inline-flex items-center gap-2 rounded-md bg-red-600 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-sm shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-md hover:shadow-red-600/25 active:scale-[0.97]"
            >
              <Phone className="h-3.5 w-3.5 animate-pulse" />
              Darurat
            </Link>

            <div className="hidden lg:block h-5 w-px bg-border mx-1" />

            <Link
                href="/login"
                className="hidden lg:inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-1.5 text-[13px] font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98]"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
            </Link>

            <MenuToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        navigation={navigation}
      />
    </>
  );
}
