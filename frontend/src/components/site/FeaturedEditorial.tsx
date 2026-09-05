"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photoAlt } from "@/lib/media";
import type { Photo } from "@/lib/types";
import { BlurImage } from "./BlurImage";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Izabrani radovi (C) — editorial kompozicija umjesto ravnog three-column grida:
 * velika portret fotografija lijevo, uz nju manja fotografija + tekstualni blok,
 * i treća fotografija kao offset detalj. Klik → lightbox.
 */
export function FeaturedEditorial({ photos }: { photos: Photo[] }) {
  const items = photos.slice(0, 3);
  const [index, setIndex] = useState(-1);

  if (items.length === 0) {
    return <p className="text-muted">Još nema istaknutih radova.</p>;
  }

  const slides = items.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined }));
  const [big, mid, small] = items;

  const Frame = ({ photo, i, ratio, className }: { photo: Photo; i: number; ratio: string; className?: string }) => (
    <motion.button
      type="button"
      data-cursor="view"
      onClick={() => setIndex(i)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1, ease: EASE, delay: i * 0.08 }}
      className={`group relative block overflow-hidden bg-line/40 ${ratio} ${className ?? ""}`}
    >
      <BlurImage
        src={photo.thumbnailUrl || photo.url}
        alt={photoAlt(photo)}
        blurDataUrl={photo.blurDataUrl}
        fill
        sizes="(max-width: 768px) 100vw, 55vw"
        className="object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.03]"
      />
      {photo.title && (
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <p className="display-serif p-5 text-2xl text-cream">{photo.title}</p>
        </div>
      )}
    </motion.button>
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Velika portret fotografija */}
        <div className="lg:col-span-7">
          <Frame photo={big} i={0} ratio="aspect-[4/5]" />
        </div>

        {/* Desna kolona — manja fotografija + tekst + offset detalj */}
        <div className="flex flex-col gap-8 lg:col-span-5 lg:justify-between lg:pt-10">
          {mid && <Frame photo={mid} i={1} ratio="aspect-[3/2]" />}

          <div className="max-w-sm">
            {big.categoryName && <p className="eyebrow">{big.categoryName}</p>}
            <p className="display-serif mt-3 text-3xl leading-[1.1] text-ink md:text-4xl">
              {big.title ?? "Priče u kadru"}
            </p>
            {big.description && <p className="prose-editorial mt-4">{big.description}</p>}
            <Link href="/galerija" className="link-underline eyebrow mt-6 inline-block !text-ink">
              Cijela galerija
            </Link>
          </div>

          {small && <Frame photo={small} i={2} ratio="aspect-[4/5]" className="lg:ml-16 lg:w-2/3 lg:self-end" />}
        </div>
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        on={{ view: ({ index: i }) => setIndex(i) }}
        styles={{ container: { backgroundColor: "rgba(38, 37, 31, 0.97)" } }}
      />
    </div>
  );
}
