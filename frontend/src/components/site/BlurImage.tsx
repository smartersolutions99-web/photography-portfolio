"use client";

import Image, { type ImageProps } from "next/image";
import { FALLBACK_BLUR } from "@/lib/media";

/**
 * Omotač oko next/image koji uvijek prikazuje blur placeholder dok se slika učita.
 * Ako fotografija ima pravi LQIP sa backenda (`blurDataUrl`), koristi njega;
 * u suprotnom pada na neutralni gradijent u paleti sajta (`FALLBACK_BLUR`).
 * Ostali propovi (src, alt, sizes, fill, width/height, className…) prosljeđuju se
 * netaknuti, pa se koristi identično kao next/image.
 */
type BlurImageProps = Omit<ImageProps, "placeholder"> & {
  blurDataUrl?: string | null;
};

export function BlurImage({ blurDataUrl, ...props }: BlurImageProps) {
  return <Image {...props} placeholder="blur" blurDataURL={blurDataUrl || FALLBACK_BLUR} />;
}
