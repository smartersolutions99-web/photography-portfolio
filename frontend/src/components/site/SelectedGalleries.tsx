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
 * Iz galerije (G) — fashion/editorial kolaž: fotografije različitih proporcija,
 * asimetrično raspoređene sa vazduhom. Uredno i kontrolisano; na mobile-u čist
 * single-column ritam. Klik → lightbox.
 */
export function SelectedGalleries({ photos }: { photos: Photo[] }) {
  const items = photos.slice(0, 4);
  const [index, setIndex] = useState(-1);
  if (items.length === 0) return null;

  const slides = items.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined }));

  const Frame = ({ photo, i, ratio }: { photo: Photo; i: number; ratio: string }) => (
    <motion.button
      type="button"
      data-cursor="view"
      onClick={() => setIndex(i)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1, ease: EASE, delay: (i % 2) * 0.08 }}
      className={`group relative block w-full overflow-hidden bg-line/40 ${ratio}`}
    >
      <BlurImage
        src={photo.thumbnailUrl || photo.url}
        alt={photoAlt(photo)}
        blurDataUrl={photo.blurDataUrl}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="p-5">
          {photo.categoryName && <p className="eyebrow !text-cream/70">{photo.categoryName}</p>}
          {photo.title && <p className="display-serif mt-1 text-2xl text-cream">{photo.title}</p>}
        </div>
      </div>
    </motion.button>
  );

  return (
    <section className="bg-surface px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-20">
          <div>
            <p className="eyebrow">Izbor iz radova</p>
            <h2 className="display-serif mt-4 text-5xl text-ink md:text-7xl">Iz galerije</h2>
          </div>
          <Link href="/galerija" className="link-underline eyebrow !text-ink">
            Pogledaj sve
          </Link>
        </div>

        {/* Red 1 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end md:gap-8">
          {items[0] && (
            <div className="md:col-span-8">
              <Frame photo={items[0]} i={0} ratio="aspect-[3/2]" />
            </div>
          )}
          {items[1] && (
            <div className="md:col-span-4">
              <Frame photo={items[1]} i={1} ratio="aspect-[3/4]" />
            </div>
          )}
        </div>

        {/* Red 2 */}
        {(items[2] || items[3]) && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-12 md:items-start md:gap-8">
            {items[2] && (
              <div className="md:col-span-4 md:mt-16">
                <Frame photo={items[2]} i={2} ratio="aspect-[3/4]" />
              </div>
            )}
            <div className="hidden md:col-span-3 md:block" />
            {items[3] && (
              <div className="md:col-span-5">
                <Frame photo={items[3]} i={3} ratio="aspect-[4/5]" />
              </div>
            )}
          </div>
        )}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        on={{ view: ({ index: i }) => setIndex(i) }}
        styles={{ container: { backgroundColor: "rgba(38, 37, 31, 0.97)" } }}
      />
    </section>
  );
}
