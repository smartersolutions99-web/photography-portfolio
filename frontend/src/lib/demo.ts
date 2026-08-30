import type { About, Category, CategoryDetail, ContactInfo, Home, Photo } from "./types";

// Demo sadržaj koji se prikazuje kada backend nije dostupan (razvoj / prvi pokret).
// Slike su sa Unsplash-a i služe samo kao placeholder.

function img(id: string, w = 1200, h = 1600): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

// --- Kategorije (glavne) i potkategorije -------------------------------------

interface CatMeta {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId?: number;
  parentSlug?: string;
  parentName?: string;
}

const PARENTS: CatMeta[] = [
  { id: 1, name: "Vjenčanja", slug: "vjencanja", description: "Priče ispričane u jednom danu." },
  { id: 2, name: "Portreti", slug: "portreti", description: "Ljudi, karakter, svjetlo." },
  { id: 3, name: "Pejzaži", slug: "pejzazi", description: "Tišina i širina prostora." },
];

const SUBS: CatMeta[] = [
  { id: 11, name: "Ceremonija", slug: "ceremonija", description: "Zavjeti i emocija.", parentId: 1, parentSlug: "vjencanja", parentName: "Vjenčanja" },
  { id: 12, name: "Mladenci", slug: "mladenci", description: "Portreti para.", parentId: 1, parentSlug: "vjencanja", parentName: "Vjenčanja" },
  { id: 13, name: "Detalji", slug: "detalji", description: "Prstenje, cvijeće, dekor.", parentId: 1, parentSlug: "vjencanja", parentName: "Vjenčanja" },
  { id: 21, name: "Studijski", slug: "studijski", description: "Kontrolisano svjetlo.", parentId: 2, parentSlug: "portreti", parentName: "Portreti" },
  { id: 22, name: "Na otvorenom", slug: "na-otvorenom", description: "Prirodno svjetlo.", parentId: 2, parentSlug: "portreti", parentName: "Portreti" },
  { id: 31, name: "Priroda", slug: "priroda", description: "Planine, jezera, šume.", parentId: 3, parentSlug: "pejzazi", parentName: "Pejzaži" },
  { id: 32, name: "Urbano", slug: "urbano", description: "Grad i arhitektura.", parentId: 3, parentSlug: "pejzazi", parentName: "Pejzaži" },
];

const ALL_META = [...PARENTS, ...SUBS];
const metaBySlug = new Map(ALL_META.map((m) => [m.slug, m]));

// --- Fotografije -------------------------------------------------------------

interface DemoDef {
  id: number;
  unsplash: string;
  title: string;
  description: string;
  sub: string; // slug potkategorije
  featured: boolean;
  w: number;
  h: number;
}

const DEFS: DemoDef[] = [
  { id: 1, unsplash: "1519741497674-611481863552", title: "Zavjet", description: "Trenutak pred oltarom", sub: "ceremonija", featured: true, w: 1200, h: 1600 },
  { id: 2, unsplash: "1606216794074-735e91aa2c92", title: "Oltar", description: "Razmjena prstenja", sub: "ceremonija", featured: false, w: 1600, h: 1067 },
  { id: 3, unsplash: "1465495976277-4387d4b0b4c6", title: "Prvi ples", description: "Svjetlo zalaska", sub: "mladenci", featured: true, w: 1600, h: 1067 },
  { id: 4, unsplash: "1519225421980-715cb0215aed", title: "Uz obalu", description: "Šetnja u suton", sub: "mladenci", featured: false, w: 1200, h: 1600 },
  { id: 5, unsplash: "1522673607200-164d1b6ce486", title: "Zagrljaj", description: "Tihi trenutak", sub: "mladenci", featured: false, w: 1600, h: 1067 },
  { id: 6, unsplash: "1511285560929-80b456fea0bc", title: "Prstenje", description: "Detalj dana", sub: "detalji", featured: false, w: 1600, h: 1067 },
  { id: 7, unsplash: "1583939003579-730e3918a45a", title: "Buket", description: "Cvijeće mlade", sub: "detalji", featured: true, w: 1200, h: 1600 },
  { id: 8, unsplash: "1524504388940-b1c1722653e1", title: "Pogled", description: "Studio portret", sub: "studijski", featured: true, w: 1200, h: 1500 },
  { id: 9, unsplash: "1500648767791-00dcc994a43e", title: "Karakter", description: "Crno-bijela studija", sub: "studijski", featured: false, w: 1200, h: 1500 },
  { id: 10, unsplash: "1517841905240-472988babdf9", title: "Osmijeh", description: "Toplo popodne", sub: "na-otvorenom", featured: false, w: 1200, h: 1600 },
  { id: 11, unsplash: "1506794778202-cad84cf45f1d", title: "Zlatni sat", description: "Svjetlo kroz drveće", sub: "na-otvorenom", featured: true, w: 1200, h: 1500 },
  { id: 12, unsplash: "1508214751196-bcfd4ca60f91", title: "Vjetar", description: "Pokret i sloboda", sub: "na-otvorenom", featured: false, w: 1200, h: 1600 },
  { id: 13, unsplash: "1441974231531-c6227db76b6e", title: "Šuma", description: "Jutarnja izmaglica", sub: "priroda", featured: true, w: 1600, h: 1067 },
  { id: 14, unsplash: "1470770841072-f978cf4d019e", title: "Jezero", description: "Mir prije zore", sub: "priroda", featured: false, w: 1600, h: 1067 },
  { id: 15, unsplash: "1506905925346-21bda4d32df4", title: "Planina", description: "Iznad oblaka", sub: "priroda", featured: false, w: 1600, h: 1067 },
  { id: 16, unsplash: "1449824913935-59a10b8d2000", title: "Grad", description: "Ritam ulice", sub: "urbano", featured: false, w: 1600, h: 1067 },
  { id: 17, unsplash: "1480714378408-67cf0d13bc1b", title: "Krovovi", description: "Panorama grada", sub: "urbano", featured: true, w: 1600, h: 1067 },
  { id: 18, unsplash: "1502602898657-3e91760cbb34", title: "Ulica", description: "Svjetla i sjenke", sub: "urbano", featured: false, w: 1600, h: 1067 },
];

function toPhoto(d: DemoDef): Photo {
  const meta = metaBySlug.get(d.sub)!;
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    categoryId: meta.id,
    categorySlug: meta.slug,
    categoryName: meta.name,
    url: img(d.unsplash, d.w, d.h),
    thumbnailUrl: img(d.unsplash, Math.round(d.w * 0.6), Math.round(d.h * 0.6)),
    width: d.w,
    height: d.h,
    featured: d.featured,
    displayOrder: d.id,
  };
}

export const photos: Photo[] = DEFS.map(toPhoto);

function photosForSlug(slug: string): Photo[] {
  const meta = metaBySlug.get(slug);
  if (!meta) return [];
  // glavna kategorija -> skupi iz svih potkategorija
  const childSlugs = SUBS.filter((s) => s.parentSlug === slug).map((s) => s.slug);
  const slugs = childSlugs.length > 0 ? childSlugs : [slug];
  return photos.filter((p) => p.categorySlug && slugs.includes(p.categorySlug));
}

function toCategory(meta: CatMeta): Category {
  const inCat = photosForSlug(meta.slug);
  return {
    id: meta.id,
    name: meta.name,
    slug: meta.slug,
    description: meta.description,
    coverUrl: inCat[0]?.url ?? null,
    coverPhotoId: inCat[0]?.id ?? null,
    displayOrder: meta.id,
    photoCount: inCat.length,
    parentId: meta.parentId ?? null,
    parentSlug: meta.parentSlug ?? null,
    parentName: meta.parentName ?? null,
  };
}

export const categories: Category[] = ALL_META.map(toCategory);

// --- Stranice ----------------------------------------------------------------

export const home: Home = {
  siteName: "STUDIO",
  tagline: "Fotografija koja pripovijeda",
  heroTitle: "Vizuelne priče",
  heroSubtitle: "Dozvolite da vaše najljepše trenutke sačuvamo zauvijek.",
  heroUrl: img("1519741497674-611481863552", 1900, 1200),
  pressQuote: "Postoji li neko ko ovjekovječuje emociju kao ovaj objektiv?",
  pressSource: "IZ RECENZIJE",
  editorialStatement:
    "Nije riječ samo o dobrim fotografijama — riječ je o cijelom doživljaju koji ostaje s vama.",
  featured: photos.filter((p) => p.featured),
};

export const about: About = {
  heading: "O meni",
  body:
    "Fotografijom se bavim više od deset godina. Kroz objektiv tražim iskrene, neponovljive trenutke i pretvaram ih u bezvremene slike.\n\nVjerujem da svaka priča zaslužuje da bude ispričana s pažnjom, stilom i emocijom — bilo da je riječ o vjenčanju, portretu ili tišini pejzaža.",
  portraitUrl: img("1500648767791-00dcc994a43e", 1000, 1300),
};

export const contact: ContactInfo = {
  siteName: "STUDIO",
  tagline: "Fotografija koja pripovijeda",
  email: "hello@example.com",
  phone: "+382 68 000 000",
  address: "Podgorica, Crna Gora",
  location: "Crna Gora i šire",
  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
};

export function categoryDetail(slug: string): CategoryDetail {
  const meta = metaBySlug.get(slug) ?? PARENTS[0];
  return {
    category: toCategory(meta),
    photos: photosForSlug(meta.slug),
  };
}
