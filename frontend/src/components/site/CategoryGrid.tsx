"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { CategoryNode } from "@/lib/types";

/**
 * Kategorije kao velike slikovne pločice — cover slika, naziv preko slike,
 * potkategorije kao pilule. Jasna hijerarhija, elegantno i slikovito.
 */
export function CategoryGrid({ nodes }: { nodes: CategoryNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {nodes.map((n, i) => (
        <motion.div
          key={n.id}
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
        >
          <Link
            href={`/kategorije/${n.slug}`}
            data-cursor="view"
            className="group relative block aspect-[3/4] overflow-hidden bg-line/40"
          >
            {n.coverUrl && (
              <Image
                src={n.coverUrl}
                alt={n.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
              <p className="eyebrow !text-cream/60">{n.photoCount} radova</p>
              <h3 className="display-serif mt-1 text-3xl text-cream md:text-4xl">{n.name}</h3>
              {n.children.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {n.children.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/85 backdrop-blur-sm transition-colors group-hover:border-cream/50"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <span className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream/80 opacity-0 transition-all duration-500 group-hover:opacity-100">
              →
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
