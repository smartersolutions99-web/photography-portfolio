"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@/lib/types";
import { MaskReveal } from "./MaskReveal";

/**
 * Masonry kolaž istaknutih radova — svaka slika u svom prirodnom odnosu
 * (portreti visoki, pejzaži široki-niski) se pakuju u stupce. Bez kropovanja,
 * dinamičan kolaž. Klik -> lightbox, hover -> suptilni naziv.
 */
export function FeaturedWorks({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1);
  const slides = photos.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined }));

  if (photos.length === 0) {
    return <p className="text-muted">Još nema istaknutih radova.</p>;
  }

  return (
    <div>
      <div className="columns-1 gap-4 sm:columns-2 md:gap-6 xl:columns-3">
        {photos.map((photo, i) => (
          <MaskReveal key={photo.id} className="mb-4 break-inside-avoid md:mb-6" delay={(i % 3) * 0.06}>
            <button
              type="button"
              data-cursor="view"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden bg-line/40"
            >
              <Image
                src={photo.url}
                alt={photo.title ?? "Rad"}
                width={photo.width ?? 1000}
                height={photo.height ?? 1250}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 30vw"
                className="h-auto w-full object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/75 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="translate-y-3 p-5 transition-transform duration-500 ease-editorial group-hover:translate-y-0">
                  {photo.categoryName && <p className="eyebrow !text-cream/60">{photo.categoryName}</p>}
                  {photo.title && <p className="display-serif mt-1 text-2xl text-cream">{photo.title}</p>}
                </div>
              </div>
            </button>
          </MaskReveal>
        ))}
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
