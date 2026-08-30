import Image from "next/image";
import Link from "next/link";
import { GalleryExplorer } from "@/components/site/GalleryExplorer";
import { Reveal } from "@/components/site/Reveal";
import { getCategories, getPhotos } from "@/lib/api";
import { buildTree } from "@/lib/categories";
import type { CategoryNode } from "@/lib/types";

function findNode(nodes: CategoryNode[], slug: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const child = n.children.find((c) => c.slug === slug);
    if (child) return { ...child, children: [] };
  }
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const nodes = buildTree(await getCategories());
  const node = findNode(nodes, params.slug);
  return { title: `${node?.name ?? "Kategorija"} — Studio` };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  const nodes = buildTree(categories);
  const node = findNode(nodes, params.slug);

  if (!node) {
    return (
      <section className="px-5 pb-24 pt-40 text-center md:pt-56">
        <p className="display-serif text-3xl">Kategorija nije pronađena.</p>
        <Link href="/kategorije" className="link-underline eyebrow mt-6 inline-block !text-ink">
          Sve kategorije
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="relative flex h-[70svh] min-h-[420px] items-end overflow-hidden bg-ink">
        {node.coverUrl && (
          <Image src={node.coverUrl} alt={node.name} fill priority sizes="100vw" className="object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-16 md:px-10 md:pb-24">
          <div className="flex items-center gap-3 text-cream/70">
            <Link href="/kategorije" className="eyebrow !text-cream/70 hover:!text-cream">
              Kategorije
            </Link>
            {node.parentSlug && node.parentName && (
              <>
                <span className="text-cream/40">/</span>
                <Link href={`/kategorije/${node.parentSlug}`} className="eyebrow !text-cream/70 hover:!text-cream">
                  {node.parentName}
                </Link>
              </>
            )}
          </div>
          <h1 className="display-serif mt-3 text-5xl text-cream md:text-8xl">{node.name}</h1>
          {node.description && (
            <p className="mt-4 max-w-xl text-sm text-cream/80 md:text-base">{node.description}</p>
          )}
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <GalleryExplorer photos={photos} nodes={[node]} initialParent={node.slug} hideParentLevel />
        </div>
      </section>
    </>
  );
}
