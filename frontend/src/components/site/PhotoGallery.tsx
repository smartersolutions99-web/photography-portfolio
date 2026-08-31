"use client";

import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photoAlt } from "@/lib/media";
import type { Category, Photo } from "@/lib/types";
import { BlurImage } from "./BlurImage";

interface PhotoGalleryProps {
  photos: Photo[];
  categories?: Category[];
}

export function PhotoGallery({ photos, categories }: PhotoGalleryProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [index, setIndex] = useState(-1);

  const filtered = useMemo(() => {
    if (!activeSlug) return photos;
    return photos.filter((p) => p.categorySlug === activeSlug);
  }, [photos, activeSlug]);

  const slides = useMemo(
    () => filtered.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined })),
    [filtered],
  );

  return (
    <div>
      {categories && categories.length > 0 && (
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => setActiveSlug(null)}
            className={`eyebrow transition-colors ${activeSlug === null ? "!text-ink" : "!text-muted hover:!text-ink"}`}
          >
            Sve
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActiveSlug(c.slug)}
              className={`eyebrow transition-colors ${activeSlug === c.slug ? "!text-ink" : "!text-muted hover:!text-ink"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="masonry">
        {filtered.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            data-cursor="view"
            className="group relative block w-full overflow-hidden bg-line/40 text-left"
          >
            <BlurImage
              src={p.thumbnailUrl || p.url}
              alt={photoAlt(p)}
              blurDataUrl={p.blurDataUrl}
              width={p.width ?? 1000}
              height={p.height ?? 1250}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full object-cover transition-transform duration-[1200ms] ease-editorial group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="p-5">
                {p.categoryName && <p className="eyebrow !text-cream/70">{p.categoryName}</p>}
                {p.title && <p className="display-serif mt-1 text-2xl text-cream">{p.title}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-muted">Još nema radova u ovoj kategoriji.</p>
      )}

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
