"use client";

import Link from "next/link";
import { Phone, LogIn, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  navigation: { name: string; href: string }[];
}

export function MobileMenu({
  isOpen,
  onClose,
  pathname,
  navigation,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 lg:hidden"
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
            variants={{
              closed: { opacity: 0 },
              open: { opacity: 1 },
            }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.nav
            className="absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-white shadow-2xl shadow-black/20"
            variants={{
              closed: { x: "100%" },
              open: { x: 0 },
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
          >
            <div className="flex h-full flex-col pt-20 pb-8 px-6">
              {/* Nav Links */}
              <div className="flex-1 space-y-1">
                {navigation.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      variants={{
                        closed: { opacity: 0, x: 40 },
                        open: { opacity: 1, x: 0 },
                      }}
                      transition={{
                        delay: 0.1 + i * 0.05,
                        type: "spring",
                        damping: 25,
                        stiffness: 250,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center justify-between py-3 border-b border-border/40 transition-colors",
                          isActive
                            ? "border-primary/40"
                            : "hover:border-primary/20"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[15px] font-medium transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-foreground group-hover:text-primary"
                          )}
                        >
                          {item.name}
                        </span>

                        {isActive && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom actions */}
              <motion.div
                className="space-y-3 pt-6 border-t border-border/40"
                variants={{
                  closed: { opacity: 0, y: 20 },
                  open: { opacity: 1, y: 0 },
                }}
                transition={{
                  delay: 0.35,
                  type: "spring",
                  damping: 25,
                  stiffness: 250,
                }}
              >
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>

                <Link
                  href="tel:04022821110"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                >
                  <Phone className="h-4 w-4" />
                  Hubungi Posko Darurat
                </Link>
              </motion.div>

              {/* Footer */}
              <motion.p
                className="pt-6 text-[11px] text-muted-foreground text-center"
                variants={{
                  closed: { opacity: 0 },
                  open: { opacity: 1 },
                }}
                transition={{ delay: 0.45 }}
              >
                BPBD Kota Baubau &middot; Sulawesi Tenggara
              </motion.p>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
