"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photoAlt } from "@/lib/media";
import type { Photo } from "@/lib/types";
import { BlurImage } from "./BlurImage";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Jedan red — tri fotografije jedna pored druge. Klik -> lightbox. */
export function FeaturedRow({ photos }: { photos: Photo[] }) {
  const row = photos.slice(0, 3);
  const [index, setIndex] = useState(-1);

  if (row.length === 0) {
    return <p className="text-muted">Još nema istaknutih radova.</p>;
  }

  const slides = row.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined }));

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {row.map((photo, i) => (
          <motion.button
            key={photo.id}
            type="button"
            data-cursor="view"
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
            className="group relative block aspect-[4/5] overflow-hidden bg-line/40"
          >
            <BlurImage
              src={photo.thumbnailUrl || photo.url}
              alt={photoAlt(photo)}
              blurDataUrl={photo.blurDataUrl}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-105"
            />
            {photo.title && (
              <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <p className="display-serif p-5 text-2xl text-cream">{photo.title}</p>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        on={{ view: ({ index: i }) => setIndex(i) }}
        styles={{ container: { backgroundColor: "rgba(20, 17, 14, 0.96)" } }}
      />
    </div>
  );
}
