export interface Photo {
  id: number;
  title: string | null;
  description: string | null;
  categoryId: number | null;
  categorySlug: string | null;
  categoryName: string | null;
  url: string;
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
  featured: boolean;
  displayOrder: number;
  // Pravi LQIP (mali base64 blur original slike) sa backenda; null za demo/starije slike
  blurDataUrl?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  coverPhotoId: number | null;
  displayOrder: number;
  photoCount: number;
  // Hijerarhija: null/undefined = glavna kategorija; postavljeno = potkategorija
  parentId?: number | null;
  parentSlug?: string | null;
  parentName?: string | null;
}

export interface CategoryNode extends Category {
  children: Category[];
}

export interface CategoryDetail {
  category: Category;
  photos: Photo[];
}

export interface About {
  heading: string | null;
  body: string | null;
  portraitUrl: string | null;
}

export interface ContactInfo {
  siteName: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
}

export interface Home {
  siteName: string | null;
  tagline: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroUrl: string | null;
  beforeAfterUrl: string | null;
  pressQuote: string | null;
  pressSource: string | null;
  editorialStatement: string | null;
  featured: Photo[];
}

export interface SiteSettings {
  siteName: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroPhotoId: number | null;
  heroUrl: string | null;
  beforeAfterPhotoId: number | null;
  beforeAfterUrl: string | null;
  pressQuote: string | null;
  pressSource: string | null;
  editorialStatement: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface Story {
  id: number;
  title: string;
  text: string;
  imageUrl: string | null;
  photoId: number | null;
  accentColor: string;
  displayOrder: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
