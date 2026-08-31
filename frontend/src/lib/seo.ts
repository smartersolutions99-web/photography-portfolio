import type { Metadata } from "next";

/**
 * Osnovni URL sajta — koristi se za kanonske linkove, sitemap, robots i OG.
 * Postaviti `NEXT_PUBLIC_SITE_URL` na produkcijski domen (npr. https://studio.me).
 * Bez trailing slash-a.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

/** Brend/naziv koji ide u title template i OG `siteName`. */
export const SITE_NAME = "Studio";

export const DEFAULT_DESCRIPTION =
  "Portfolio fotografa — vjenčanja, portreti i pejzaži. Vizuelne priče ispričane sa stilom i emocijom.";

/** Apsolutni URL iz relativne putanje (ili prosljeđuje već apsolutni). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Sastavlja `Metadata` za jednu stranicu: naslov, opis, kanonski link i pun
 * Open Graph / Twitter blok. OG blok je samodovoljan (ne oslanja se na
 * nasljeđivanje iz root layout-a, jer Next zamjenjuje `openGraph` po segmentu).
 */
export function pageMetadata({
  title,
  description,
  path = "/",
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
}): Metadata {
  const url = absoluteUrl(path);
  const desc = description || DEFAULT_DESCRIPTION;
  const ogTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Fotografija`;
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "sr_RS",
      siteName: SITE_NAME,
      title: ogTitle,
      description: desc,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}
