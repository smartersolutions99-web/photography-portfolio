"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CategoryNode } from "@/lib/types";

/**
 * Interaktivni prikaz glavnih kategorija: lista sa hover-reveal slikom desno
 * i potkategorijama kao „pilulama" — jasna hijerarhija.
 */
export function CategoryShowcase({ nodes }: { nodes: CategoryNode[] }) {
  const [active, setActive] = useState(0);
  const activeNode = nodes[active];

  if (nodes.length === 0) return null;

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <div>
        {nodes.map((n, i) => (
          <Link
            key={n.id}
            href={`/kategorije/${n.slug}`}
            onMouseEnter={() => setActive(i)}
            className="group block border-t border-line py-6 last:border-b md:py-9"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="display-serif text-4xl transition-colors duration-500 group-hover:text-accent md:text-6xl">
                {n.name}
              </h3>
              <span className="eyebrow shrink-0">{n.photoCount} radova</span>
            </div>

            {n.children.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {n.children.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors group-hover:border-ink/30"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {/* Slika unutar reda — samo na mobilnom (nema hover) */}
            {n.coverUrl && (
              <div className="relative mt-5 aspect-[16/10] w-full overflow-hidden bg-line/40 md:hidden">
                <Image src={n.coverUrl} alt={n.name} fill sizes="100vw" className="object-cover" />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Sticky preview — desktop */}
      <div className="sticky top-24 hidden aspect-[4/5] self-start overflow-hidden bg-line/40 md:block">
        <AnimatePresence mode="wait">
          {activeNode?.coverUrl && (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image src={activeNode.coverUrl} alt={activeNode.name} fill sizes="45vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-ink/0" />
              <div className="absolute bottom-0 p-8">
                <p className="eyebrow !text-cream/70">
                  {activeNode.children.length > 0
                    ? `${activeNode.children.length} potkategorije`
                    : "Kategorija"}
                </p>
                <p className="display-serif mt-1 text-4xl text-cream">{activeNode.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
