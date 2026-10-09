"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photoAlt } from "@/lib/media";
import type { Photo } from "@/lib/types";
import { BlurImage } from "./BlurImage";

const EASE = [0.22, 1, 0.36, 1] as const;

// 4 različite animacije pojavljivanja — smjenjuju se po slikama
const REVEALS = [
  { initial: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }, whileInView: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } }, // maska odozdo
  { initial: { opacity: 0, y: 80 }, whileInView: { opacity: 1, y: 0 } }, // dizanje
  { initial: { opacity: 0, scale: 0.85 }, whileInView: { opacity: 1, scale: 1 } }, // zoom
  { initial: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }, whileInView: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } }, // brisanje slijeva
] as const;

// Asimetrija: variraju širina, poravnanje unutar kolone i razmak ispod
// (širine su relativne na kolonu, pa mix malih/velikih radi i kad je mobilni
// prikaz već u 2 kolone, ne samo na desktopu)
const LAYOUTS = [
  "w-full mb-3 md:mb-10",
  "w-[88%] ml-auto mb-8 md:mb-24",
  "w-[95%] mb-4 md:mb-14",
  "w-[80%] mx-auto mb-10 md:mb-28",
  "w-[90%] mr-auto mb-5 md:mb-16",
] as const;

/**
 * Asimetrični masonry kolaž istaknutih radova. Slike u prirodnom odnosu, bez
 * kropovanja; variraju širine, poravnanje i razmaci (editorial „dah"). Svaka
 * slika ulazi jednom od 4 animacije. Klik -> lightbox, hover -> naziv (bez kategorije).
 * 2 kolone već na mobilnom (ne samo od sm naviše) da se vidi mix malih/velikih,
 * a ne sve naslagano u jednoj vertikalnoj koloni.
 */
export function FeaturedWorks({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1);
  const slides = photos.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined }));

  if (photos.length === 0) {
    return <p className="text-muted">Još nema istaknutih radova.</p>;
  }

  return (
    <div>
      <div className="columns-2 gap-3 sm:gap-5 md:gap-8 xl:columns-3">
        {photos.map((photo, i) => {
          const reveal = REVEALS[i % REVEALS.length];
          const layout = LAYOUTS[i % LAYOUTS.length];
          return (
            <motion.div
              key={photo.id}
              className={`break-inside-avoid ${layout}`}
              initial={reveal.initial}
              whileInView={reveal.whileInView}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 1.1, ease: EASE, delay: (i % 3) * 0.05 }}
            >
              <button
                type="button"
                data-cursor="view"
                onClick={() => setIndex(i)}
                className="group relative block w-full overflow-hidden bg-line/40"
              >
                <BlurImage
                  src={photo.url}
                  alt={photoAlt(photo)}
                  blurDataUrl={photo.blurDataUrl}
                  width={photo.width ?? 1000}
                  height={photo.height ?? 1250}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 30vw"
                  className="h-auto w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.04]"
                />
                {photo.title && (
                  <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/75 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="translate-y-3 p-5 transition-transform duration-500 ease-editorial group-hover:translate-y-0">
                      <p className="display-serif text-2xl text-cream">{photo.title}</p>
                    </div>
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        on={{ view: ({ index: idx }) => setIndex(idx) }}
        styles={{ container: { backgroundColor: "rgba(20, 17, 14, 0.96)" } }}
      />
    </div>
  );
}
