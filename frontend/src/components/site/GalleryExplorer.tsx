"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { slugsOf } from "@/lib/categories";
import { photoAlt } from "@/lib/media";
import type { CategoryNode, Photo } from "@/lib/types";
import { BlurImage } from "./BlurImage";

/**
 * Galerija sa dvonivojskim filterom: glavne kategorije (gornji red) i
 * potkategorije (drugi red, kad je glavna aktivna). Masonry + lightbox.
 */
export function GalleryExplorer({
  photos,
  nodes,
  initialParent = null,
  hideParentLevel = false,
}: {
  photos: Photo[];
  nodes: CategoryNode[];
  initialParent?: string | null;
  hideParentLevel?: boolean;
}) {
  const [parent, setParent] = useState<string | null>(initialParent);
  const [sub, setSub] = useState<string | null>(null);
  const [index, setIndex] = useState(-1);

  const parentNode = useMemo(() => nodes.find((n) => n.slug === parent) ?? null, [nodes, parent]);

  const filtered = useMemo(() => {
    if (sub) return photos.filter((p) => p.categorySlug === sub);
    if (parentNode) {
      const set = new Set(slugsOf(parentNode));
      return photos.filter((p) => p.categorySlug && set.has(p.categorySlug));
    }
    return photos;
  }, [photos, parentNode, sub]);

  const slides = useMemo(
    () => filtered.map((p) => ({ src: p.url, title: p.title ?? undefined, description: p.description ?? undefined })),
    [filtered],
  );

  function selectParent(slug: string | null) {
    setParent(slug);
    setSub(null);
  }

  const filterKey = `${parent ?? "all"}-${sub ?? "all"}`;

  return (
    <div>
      {/* Nivo 1: glavne kategorije */}
      {!hideParentLevel && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <FilterChip active={parent === null} onClick={() => selectParent(null)}>
            Sve
          </FilterChip>
          {nodes.map((n) => (
            <FilterChip key={n.id} active={parent === n.slug} onClick={() => selectParent(n.slug)}>
              {n.name}
            </FilterChip>
          ))}
        </div>
      )}

      {/* Nivo 2: potkategorije */}
      <AnimatePresence initial={false}>
        {parentNode && parentNode.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${
                hideParentLevel ? "" : "mt-4 border-t border-line pt-4"
              }`}
            >
              <FilterChip small active={sub === null} onClick={() => setSub(null)}>
                Sve — {parentNode.name}
              </FilterChip>
              {parentNode.children.map((c) => (
                <FilterChip key={c.id} small active={sub === c.slug} onClick={() => setSub(c.slug)}>
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mreža */}
      <p className="eyebrow mt-8 !text-muted">{filtered.length} fotografija</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={filterKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="masonry mt-6"
        >
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
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && <p className="py-20 text-center text-muted">Nema fotografija u ovom izboru.</p>}

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

function FilterChip({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`eyebrow transition-colors ${small ? "!text-[0.62rem]" : ""} ${
        active ? "!text-ink" : "!text-muted hover:!text-ink"
      }`}
    >
      {children}
    </button>
  );
}
