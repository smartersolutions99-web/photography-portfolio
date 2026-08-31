import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

// Sitemap se regeneriše na sat vremena (kategorije se rijetko mijenjaju).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "monthly" },
    { path: "/galerija", priority: 0.8, changeFrequency: "weekly" },
    { path: "/kategorije", priority: 0.7, changeFrequency: "monthly" },
    { path: "/o-nama", priority: 0.5, changeFrequency: "yearly" },
    { path: "/kontakt", priority: 0.5, changeFrequency: "yearly" },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: r.priority,
  }));

  // getCategories ima vlastiti fallback (demo) i ne baca izuzetak.
  const categories = await getCategories();
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/kategorije/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
