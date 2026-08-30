"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Otkriva sadržaj „brisanjem" odozdo (clip-path) pri ulasku u vidno polje. */
export function MaskReveal({
  children,
  className,
  delay = 0,
  duration = 1.1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
