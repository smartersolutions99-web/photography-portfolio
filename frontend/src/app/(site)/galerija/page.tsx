import { GalleryExplorer } from "@/components/site/GalleryExplorer";
import { Reveal } from "@/components/site/Reveal";
import { getCategories, getPhotos } from "@/lib/api";
import { buildTree } from "@/lib/categories";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Galerija",
  description: "Kompletan portfolio radova — pregled svih fotografija po kategorijama i potkategorijama.",
  path: "/galerija",
});

export default async function GalerijaPage() {
  const [photos, categories] = await Promise.all([getPhotos(), getCategories()]);
  const nodes = buildTree(categories);

  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-12 md:mb-16">
          <p className="eyebrow">Portfolio</p>
          <h1 className="display-serif mt-3 text-5xl md:text-8xl">Galerija</h1>
          <p className="mt-4 max-w-xl text-muted">
            Izaberi kategoriju, pa potkategoriju — ili pregledaj sve odjednom.
          </p>
        </Reveal>
        <GalleryExplorer photos={photos} nodes={nodes} />
      </div>
    </section>
  );
}
