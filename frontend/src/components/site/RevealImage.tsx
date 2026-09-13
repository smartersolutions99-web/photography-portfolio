"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Kino-efekat otkrivanja slike: „zavesa" se diže odozdo (clip-path) uz blag
 * zoom-out iz uvećanog stanja. Koristi se za editorijalne/luksuzne fotografske
 * blokove gdje običan fade djeluje presiromašno.
 */
export function RevealImage({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative h-full w-full ${className ?? ""}`}
      initial={{ opacity: 0, scale: 1.12 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.3, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
