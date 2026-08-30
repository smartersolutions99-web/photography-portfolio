import type { Category, CategoryNode, Photo } from "./types";

/** Grupiše ravnu listu kategorija u stablo (glavne + njihove potkategorije). */
export function buildTree(categories: Category[]): CategoryNode[] {
  const parents = categories.filter((c) => !c.parentId);
  const byParent = new Map<number, Category[]>();
  for (const c of categories) {
    if (c.parentId) {
      const arr = byParent.get(c.parentId) ?? [];
      arr.push(c);
      byParent.set(c.parentId, arr);
    }
  }
  return parents
    .map((p) => ({ ...p, children: (byParent.get(p.id) ?? []).sort(sortByOrder) }))
    .sort(sortByOrder);
}

function sortByOrder(a: Category, b: Category): number {
  return (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name);
}

/** Svi slug-ovi koji pripadaju kategoriji (sama + potkategorije). */
export function slugsOf(node: CategoryNode): string[] {
  return [node.slug, ...node.children.map((c) => c.slug)];
}

/** Filtrira fotografije koje pripadaju datom čvoru (uključujući potkategorije). */
export function photosIn(photos: Photo[], node: CategoryNode): Photo[] {
  const set = new Set(slugsOf(node));
  return photos.filter((p) => p.categorySlug && set.has(p.categorySlug));
}
