"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Editorial zaglavlje sekcije: tanka linija (šav između sekcija) + numerisana
 * labela + naslov, uz opcioni link. Daje jasan ritam kroz sajt.
 */
export function SectionHeader({
  index,
  label,
  title,
  href,
  linkLabel,
  className,
}: {
  index: string;
  label: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={`border-t border-ink/15 pt-6 md:pt-8 ${className ?? ""}`}>
      <motion.div
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="eyebrow pt-1 tabular-nums !text-ink/35">{index}</span>
          <div>
            <p className="eyebrow">{label}</p>
            <h2 className="display-serif mt-2 text-4xl md:text-6xl">{title}</h2>
          </div>
        </div>
        {href && linkLabel && (
          <Link href={href} className="link-underline eyebrow shrink-0 !text-ink">
            {linkLabel}
          </Link>
        )}
      </motion.div>
    </div>
  );
}
