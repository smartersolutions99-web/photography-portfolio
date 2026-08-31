import type { Photo } from "./types";

/**
 * Fallback „blur" placeholder — mali SVG gradijent u paleti sajta (cream → line).
 * Koristi se kad fotografija nema pravi LQIP sa backenda (demo slike, starije
 * fotografije uploadovane prije nego što je backend počeo da generiše blur).
 *
 * Zašto SVG data-URI (a ne base64): `encodeURIComponent` radi isto i na serveru i
 * u browseru — bez `Buffer`/`btoa` zavisnosti — pa se modul može importovati i iz
 * server i iz client komponenti. next/image ovaj data-URI renderuje zamućen i
 * skaliran dok se prava slika ne učita, tako da polje nikad nije prazno.
 */
const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#EAE3D8"/><stop offset="1" stop-color="#D4CABB"/>' +
  "</linearGradient></defs><rect width=\"12\" height=\"16\" fill=\"url(#g)\"/></svg>";

export const FALLBACK_BLUR = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_SVG)}`;

/**
 * Opisni `alt` tekst za fotografiju — bolji za pristupačnost i SEO od golog
 * „Fotografija". Spaja naslov i kategoriju kad postoje.
 */
export function photoAlt(photo: Pick<Photo, "title" | "categoryName">): string {
  const parts = [photo.title, photo.categoryName].filter((v): v is string => Boolean(v));
  if (parts.length === 0) return "Fotografija iz portfolija";
  return parts.join(" — ");
}
