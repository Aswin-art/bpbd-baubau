"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldOff } from "lucide-react";
import Link from "next/link";

export function ForbiddenPage() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="w-full h-full border-[0.5px] border-foreground/5 grid grid-cols-6 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-full border-r-[0.5px] border-foreground/5 last:border-r-0"
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-3xl"
        >
          {/* Error Code / Label */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-sm md:text-base uppercase tracking-widest text-destructive">
              /// ACCESS DENIED
            </span>
            <div className="h-px w-12 bg-destructive" />
            <span className="font-mono text-sm md:text-base text-foreground/50">
              ERR_CODE_403
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-clash text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-8 uppercase">
            Access <br />
            <span className="text-foreground/20">Denied</span>
          </h1>

          {/* Description */}
          <p className="font-satoshi text-lg md:text-xl text-foreground/70 max-w-xl mb-12 leading-relaxed">
            You do not have the required permissions to access this page.
            Contact your administrator if you believe this is an error.
          </p>

          {/* Actions */}
          <Link href="/dashboard">
            <Button className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-md h-12 px-8 font-medium text-base group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Return to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Footer */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex justify-between items-end pointer-events-none z-10">
        <div className="font-mono text-xs text-foreground/30">
          SIMARS SYSTEM v1.0
        </div>
        <div className="font-mono text-xs text-foreground/30 text-right flex items-center gap-2">
          <ShieldOff className="w-3 h-3" />
          PERMISSION: DENIED
        </div>
      </div>
    </div>
  );
}
