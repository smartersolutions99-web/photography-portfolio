import type { About, Category, CategoryDetail, ContactInfo, Home, Photo, Story } from "./types";
import * as demo from "./demo";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const REVALIDATE = 30;

// Ako backend „spava" (Render cold start ~60-90s), ne držimo stranicu — nakon
// ovog vremena padamo na demo umjesto da SSR visi. Warm backend odgovara <1s.
const FETCH_TIMEOUT_MS = 12000;

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}/api/public${path}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[api] backend nedostupan za ${path} — koristim demo podatke (${(e as Error).message})`);
    }
    return fallback;
  }
}

// Napomena: dok je baza prazna (nema fotografija), prikazuje se demo sadržaj
// da bi sajt izgledao potpuno. Čim dodaš svoje radove kroz /admin, prikazuju se oni.

export async function getHome(): Promise<Home> {
  const home = await getJson<Home>("/home", demo.home);
  const empty = !home.heroUrl && (!home.featured || home.featured.length === 0);
  return empty ? demo.home : home;
}

export async function getPhotos(): Promise<Photo[]> {
  const photos = await getJson<Photo[]>("/photos", demo.photos);
  return photos.length > 0 ? photos : demo.photos;
}

export async function getCategories(): Promise<Category[]> {
  const categories = await getJson<Category[]>("/categories", demo.categories);
  return categories.length > 0 ? categories : demo.categories;
}

export async function getCategory(slug: string): Promise<CategoryDetail> {
  const detail = await getJson<CategoryDetail>(`/categories/${slug}`, demo.categoryDetail(slug));
  return detail.photos && detail.photos.length > 0 ? detail : demo.categoryDetail(slug);
}

export async function getAbout(): Promise<About> {
  const about = await getJson<About>("/about", demo.about);
  return about.portraitUrl ? about : demo.about;
}

export async function getStories(): Promise<Story[]> {
  const stories = await getJson<Story[]>("/stories", demo.stories);
  return stories.length > 0 ? stories : demo.stories;
}

export async function getContact(): Promise<ContactInfo> {
  const contact = await getJson<ContactInfo>("/contact", demo.contact);
  return contact.instagramUrl || contact.location ? contact : demo.contact;
}

export const API_BASE = BASE;
