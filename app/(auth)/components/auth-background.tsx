"use client";

import { motion } from "motion/react";

export function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none h-[40%] mask-[linear-gradient(to_bottom,black_20%,transparent_100%)]">
      <motion.div
        initial={{ clipPath: "circle(0% at 0% 0%)", opacity: 0 }}
        animate={{ clipPath: "circle(150% at 0% 0%)", opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.orange.500)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.orange.500)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.06] mask-[linear-gradient(to_bottom_right,black_40%,transparent_100%)]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.12, scale: 1 }}
        whileInView={{ opacity: 0.2, scale: 1.1 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-orange-500 blur-[80px]"
      />
    </div>
  );
}
