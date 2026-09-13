"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { CATEGORY_PALETTE } from "@/lib/categoryPalette";
import type { CategoryNode } from "@/lib/types";
import { BlurImage } from "./BlurImage";
import { Counter, Magnetic } from "./Interactive";

// Naizmjenični obrazac: veća pločica / manja (pomjerena naniže) — asimetričan,
// snažan kontrast veličina umjesto urednog reda istih kartica.
const PATTERN = [
  { col: "md:col-span-8", aspect: "aspect-[4/5] md:aspect-[16/10]", offset: "" },
  { col: "md:col-span-4", aspect: "aspect-[4/5]", offset: "md:mt-24" },
];

function CategoryTile({ node, index }: { node: CategoryNode; index: number }) {
  const pattern = PATTERN[index % PATTERN.length];
  const accent = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];

  // Suptilan 3D tilt koji prati kursor preko kartice.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 22, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 200, damping: 22, mass: 0.5 });
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 9);
    rx.set(-py * 9);
  }
  function onMouseLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      className={`group ${pattern.col} ${pattern.offset}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.08 }}
    >
      <Link href={`/kategorije/${node.slug}`} data-cursor="view" className="block">
        <div style={{ perspective: "1200px" }}>
          <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ rotateX: srx, rotateY: sry }}
            className={`relative overflow-hidden bg-line/30 ${pattern.aspect}`}
          >
            {node.coverUrl && (
              <BlurImage
                src={node.coverUrl}
                alt={`${node.name} — kategorija`}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover grayscale-[18%] transition-all duration-[1200ms] ease-out group-hover:scale-[1.06] group-hover:grayscale-0"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent" />
            <span
              aria-hidden
              className="display-serif pointer-events-none absolute right-4 top-2 select-none text-[5rem] leading-none text-transparent [-webkit-text-stroke:1px_rgba(246,243,238,0.35)] md:text-[6.5rem]"
            >
              0{index + 1}
            </span>
            <Magnetic
              strength={0.4}
              className="absolute right-5 top-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/40 text-cream">
                →
              </span>
            </Magnetic>
          </motion.div>
        </div>

        {/* Naslov ispod slike — tekst živi na cream pozadini, ne preko fotografije */}
        <div className="mt-5">
          <p className="eyebrow !text-ink/40">
            <Counter to={node.photoCount} suffix=" radova" />
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="block h-px w-6" style={{ backgroundColor: accent }} aria-hidden />
            <h3 className="display-serif text-2xl leading-snug text-ink transition-colors duration-500 md:text-3xl">
              {node.name}
            </h3>
          </div>
          {node.children.length > 0 && (
            <p className="mt-2 text-sm text-ink/45">{node.children.map((c) => c.name).join(" · ")}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Editorijalna, asimetrična verzija prikaza kategorija — za početnu stranicu.
 * (Za pregled svih kategorija na /kategorije i dalje se koristi CategoryGrid.)
 */
export function CategoryShowcase({ nodes }: { nodes: CategoryNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
      {nodes.map((n, i) => (
        <CategoryTile key={n.id} node={n} index={i} />
      ))}
    </div>
  );
}
