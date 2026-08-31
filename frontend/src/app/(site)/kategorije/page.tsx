import { CategoryGrid } from "@/components/site/CategoryGrid";
import { Reveal } from "@/components/site/Reveal";
import { getCategories } from "@/lib/api";
import { buildTree } from "@/lib/categories";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kategorije",
  description: "Pregled kategorija i potkategorija radova — izaberi temu za detaljan pregled.",
  path: "/kategorije",
});

export default async function KategorijePage() {
  const categories = await getCategories();
  const nodes = buildTree(categories);

  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-14 md:mb-20">
          <p className="eyebrow">Pregled</p>
          <h1 className="display-serif mt-3 text-5xl md:text-8xl">Kategorije</h1>
          <p className="mt-4 max-w-xl text-muted">
            Svaka kategorija sadrži svoje potkategorije. Izaberi temu za detaljan pregled.
          </p>
        </Reveal>

        <CategoryGrid nodes={nodes} />
      </div>
    </section>
  );
}
