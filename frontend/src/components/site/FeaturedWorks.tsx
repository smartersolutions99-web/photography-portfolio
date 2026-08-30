"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@/lib/types";
import { MaskReveal } from "./MaskReveal";

// Odnos širina/visina; ako nije poznat, pretpostavi blagi landscape.
function aspectOf(p: Photo): number {
  return p.width && p.height && p.height > 0 ? p.width / p.height : 1.3;
}
function isLandscape(p: Photo): boolean {
  return aspectOf(p) >= 1.2;
}

interface Row {
  kind: "wide" | "narrow";
  photos: Photo[];
  start: number;
}

// Raspoređuje radove prema orijentaciji: landscape -> puni red; portreti -> grupe (max 3).
function buildRows(items: Photo[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  while (i < items.length) {
    if (isLandscape(items[i])) {
      rows.push({ kind: "wide", photos: [items[i]], start: i });
      i++;
    } else {
      const group: Photo[] = [items[i]];
      let k = i + 1;
      while (k < items.length && !isLandscape(items[k]) && group.length < 3) {
        group.push(items[k]);
        k++;
      }
      rows.push({ kind: "narrow", photos: group, start: i });
      i = k;
    }
  }
  return rows;
}

const NARROW_SPAN: Record<number, string> = {
  1: "md:col-span-6 md:col-start-4",
  2: "md:col-span-6",
  3: "md:col-span-4",
};

function Tile({ photo, aspect, onOpen }: { photo: Photo; aspect: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      data-cursor="view"
      onClick={onOpen}
      className={`group relative block w-full overflow-hidden bg-line/40 ${aspect}`}
    >
      <Image
        src={photo.url}
        alt={photo.title ?? "Rad"}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/75 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="translate-y-3 p-6 transition-transform duration-500 ease-editorial group-hover:translate-y-0">
          {photo.categoryName && <p className="eyebrow !text-cream/60">{photo.categoryName}</p>}
          {photo.title && <p className="display-serif mt-1 text-2xl text-cream md:text-3xl">{photo.title}</p>}
        </div>
      </div>
    </button>
  );
}

export function FeaturedWorks({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1);
  const slides = photos.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined }));
  const rows = buildRows(photos);

  if (photos.length === 0) {
    return <p className="text-muted">Još nema istaknutih radova.</p>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {rows.map((row, ri) =>
        row.kind === "wide" ? (
          <MaskReveal key={row.photos[0].id}>
            <Tile photo={row.photos[0]} aspect="aspect-[16/9]" onOpen={() => setIndex(row.start)} />
          </MaskReveal>
        ) : (
          <div key={ri} className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            {row.photos.map((photo, j) => (
              <MaskReveal key={photo.id} className={NARROW_SPAN[row.photos.length]} delay={j * 0.08}>
                <Tile photo={photo} aspect="aspect-[3/4]" onOpen={() => setIndex(row.start + j)} />
              </MaskReveal>
            ))}
          </div>
        ),
      )}

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
