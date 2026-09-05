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
        <Reveal className="mb-14 md:mb-20">
          <p className="eyebrow">Portfolio</p>
          <h1 className="display-caps mt-4 text-5xl leading-[0.95] md:text-8xl">Galerija</h1>
          <p className="prose-editorial mt-6">
            Izaberi kategoriju, pa potkategoriju — ili pregledaj sve odjednom.
          </p>
        </Reveal>
        <GalleryExplorer photos={photos} nodes={nodes} />
      </div>
    </section>
  );
}
