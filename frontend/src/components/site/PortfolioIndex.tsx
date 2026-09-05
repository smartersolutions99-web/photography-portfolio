"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { CategoryNode } from "@/lib/types";
import { BlurImage } from "./BlurImage";

/**
 * Portfolio (E) — editorial indeks kategorija umjesto card grida.
 * Desktop: velika fotografija lijevo koja se mijenja na hover reda + numerisana
 * lista kategorija desno (tanke linije, broj, naziv, strelica).
 * Mobile: vertikalni niz — fotografija iznad naziva.
 */
export function PortfolioIndex({ nodes }: { nodes: CategoryNode[] }) {
  const [active, setActive] = useState(0);
  if (nodes.length === 0) return null;

  return (
    <section className="bg-cream px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-14 md:mb-20">
          <p className="eyebrow">Istražite po temama</p>
          <h2 className="display-serif mt-4 text-5xl text-ink md:text-7xl">Portfolio</h2>
        </div>

        {/* Desktop: split fotografija + lista */}
        <div className="hidden gap-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
            {nodes.map((n, i) => (
              <div
                key={n.id}
                className="absolute inset-0 transition-opacity duration-700 ease-editorial"
                style={{ opacity: i === active ? 1 : 0 }}
                aria-hidden={i !== active}
              >
                {n.coverUrl && (
                  <BlurImage src={n.coverUrl} alt={n.name} fill sizes="45vw" className="object-cover" />
                )}
              </div>
            ))}
          </div>

          <ul className="flex flex-col justify-center">
            {nodes.map((n, i) => (
              <li key={n.id}>
                <Link
                  href={`/kategorije/${n.slug}`}
                  data-cursor="view"
                  onMouseEnter={() => setActive(i)}
                  className="group flex items-center justify-between gap-6 border-t border-ink/12 py-7 last:border-b"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="eyebrow tabular-nums !text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={`display-serif text-4xl transition-all duration-500 md:text-6xl ${
                        i === active ? "translate-x-2 text-ink" : "text-ink/70"
                      }`}
                    >
                      {n.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-4">
                    <span className="eyebrow hidden !text-ink/40 sm:block">{n.photoCount}</span>
                    <span
                      className={`text-2xl transition-all duration-500 ${
                        i === active ? "translate-x-0 text-accent opacity-100" : "-translate-x-2 opacity-0"
                      }`}
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile: vertikalni niz */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:hidden">
          {nodes.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: (i % 2) * 0.1 }}
            >
              <Link href={`/kategorije/${n.slug}`} className="group block">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-line/40">
                  {n.coverUrl && (
                    <BlurImage src={n.coverUrl} alt={n.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="display-serif text-3xl text-ink">{n.name}</h3>
                  <span className="eyebrow !text-ink/40">{n.photoCount}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
